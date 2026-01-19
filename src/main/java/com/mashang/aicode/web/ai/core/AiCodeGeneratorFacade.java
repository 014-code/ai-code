package com.mashang.aicode.web.ai.core;

import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.core.parser.CodeParserExecutor;
import com.mashang.aicode.web.ai.core.parser.MultiFileCodeParser;
import com.mashang.aicode.web.ai.core.saver.CodeFileSaverExecutor;
import com.mashang.aicode.web.ai.service.AiCodeGeneratorService;
import com.mashang.aicode.web.ai.factory.AiCodeGeneratorServiceFactory;
import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.ai.model.message.AiResponseMessage;
import com.mashang.aicode.web.ai.model.message.ToolExecutedMessage;
import com.mashang.aicode.web.ai.model.message.ToolRequestMessage;
import com.mashang.aicode.web.manager.task.GenerationTaskManager;
import com.mashang.aicode.web.manager.websocket.AppEditHandler;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.service.UserService;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.tool.ToolExecution;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

/**
 * AI代码生成门面类
 */
@Service
@Slf4j
public class AiCodeGeneratorFacade {

    @Resource
    private AiCodeGeneratorServiceFactory aiCodeGeneratorServiceFactory;

    @Resource
    private ChatHistoryService chatHistoryService;

    @Resource
    private GenerationTaskManager generationTaskManager;

    @Resource
    private ApplicationContext applicationContext;

    @Resource
    private UserService userService;

    /**
     * 中断标志映射，用于控制不同应用的流式输出的中断
     * 
     * 这个Map存储了每个应用ID对应的中断标志，就像一个"控制台"，
     * 可以单独控制每个应用的代码生成任务是否需要中断。
     * 
     * 使用ConcurrentHashMap是为了保证多线程环境下的安全性。
     * 
     * Key: 应用ID (appId)
     * Value: 中断标志 (true表示需要中断，false表示正常进行)
     */
    private final Map<Long, Boolean> interruptedFlags = new ConcurrentHashMap<>();

    /**
     * 中断指定应用的流式输出
     * @param appId 应用ID
     * @param userId 用户ID
     * @return 是否成功中断
     */
    public boolean interrupt(Long appId, Long userId) {
        interruptedFlags.put(appId, true);
        log.info("已设置中断标志，appId: {} 流式输出将被中断", appId);
        
        // 使用 GenerationTaskManager 取消任务
        boolean cancelled = generationTaskManager.cancelTask(appId, userId);
        if (cancelled) {
            log.info("成功取消生成任务，appId: {}, userId: {}", appId, userId);
        } else {
            log.warn("取消生成任务失败，appId: {}, userId: {}", appId, userId);
        }
        
        return cancelled;
    }

    /**
     * 重置指定应用的中断标志
     * @param appId 应用ID
     */
    public void resetInterrupt(Long appId) {
        interruptedFlags.put(appId, false);
        log.info("已重置中断标志，appId: {}", appId);
    }

    /**
     * 检查指定应用是否被中断
     * @param appId 应用ID
     * @return 是否被中断
     */
    public boolean isInterrupted(Long appId) {
        return interruptedFlags.getOrDefault(appId, false);
    }


    /**
     * 生成并保存代码（非流式）
     */
    public File generateAndSaveCode(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        return switch (codeGenTypeEnum) {
            case HTML -> generateAndSaveHtmlCode(userMessage, appId);
            case MULTI_FILE -> generateAndSaveMultiFileCode(userMessage, appId);
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }

    /**
     * 生成并保存HTML代码
     */
    private File generateAndSaveHtmlCode(String userMessage, Long appId) {
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId);
        HtmlCodeResult result = aiCodeGeneratorService.generateHtmlCode(Math.toIntExact(appId), userMessage);
        return CodeFileSaverExecutor.executeSaver(result, CodeGenTypeEnum.HTML, appId);
    }

    /**
     * 生成并保存多文件代码
     */
    private File generateAndSaveMultiFileCode(String userMessage, Long appId) {
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId);
        MultiFileCodeResult result = aiCodeGeneratorService.generateMultiFileCode(userMessage);
        return CodeFileSaverExecutor.executeSaver(result, CodeGenTypeEnum.MULTI_FILE, appId);
    }

    /**
     * 流式生成并保存代码（不带SSE回调）
     */
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId, Long userId) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        // 根据 appId 获取对应的 AI 服务实例
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId, codeGenTypeEnum);
        return switch (codeGenTypeEnum) {
            case HTML -> {
                Flux<String> codeStream = aiCodeGeneratorService.generateHtmlCodeStream(userMessage);
                StringBuilder codeBuilder = new StringBuilder();
                yield codeStream.doOnNext(codeBuilder::append).doOnComplete(() -> {
                    try {
                        String completeHtmlCode = codeBuilder.toString();
                        HtmlCodeResult htmlCodeResult = (HtmlCodeResult) CodeParserExecutor.executeParser(completeHtmlCode, CodeGenTypeEnum.HTML);
                        File savedDir = CodeFileSaverExecutor.executeSaver(htmlCodeResult, CodeGenTypeEnum.HTML, appId);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage());
                    }
                });
            }
            case MULTI_FILE -> {
                Flux<String> codeStream = aiCodeGeneratorService.generateMultiFileCodeStream(userMessage);
                StringBuilder codeBuilder = new StringBuilder();
                yield codeStream.doOnNext(codeBuilder::append).doOnComplete(() -> {
                    try {
                        String completeMultiFileCode = codeBuilder.toString();
                        MultiFileCodeResult multiFileResult = (MultiFileCodeResult) CodeParserExecutor.executeParser(completeMultiFileCode, CodeGenTypeEnum.MULTI_FILE);
                        File savedDir = CodeFileSaverExecutor.executeSaver(multiFileResult, CodeGenTypeEnum.MULTI_FILE, appId);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage(), e);
                    }
                });
            }
            case VUE_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateVueProjectCodeStream(appId, userMessage);
                yield processTokenStream(tokenStream, appId, userId);
            }
            case REACT_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateReactProjectCodeStream(appId, userMessage);
                yield processTokenStream(tokenStream, appId, userId);
            }
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }

    /**
     * 统一流式返回方法（带SSE回调）
     * @return
     */
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId, Consumer<String> sseCallback, Long userId, User user, String modelKey) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        // 根据 appId、codeGenType 和 modelKey 获取相对应的 AI Service
        AiCodeGeneratorService aiCodeGeneratorService;
        if (modelKey != null && !modelKey.isBlank()) {
            log.info("使用动态模型创建AI服务 - appId: {}, codeGenType: {}, modelKey: {}", appId, codeGenTypeEnum, modelKey);
            aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId, codeGenTypeEnum, modelKey);
        } else {
            log.info("使用默认模型创建AI服务 - appId: {}, codeGenType: {}", appId, codeGenTypeEnum);
            aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId, codeGenTypeEnum);
        }
        return switch (codeGenTypeEnum) {
            case HTML -> {
                Flux<String> codeStream = aiCodeGeneratorService.generateHtmlCodeStream(userMessage);
                StringBuilder codeBuilder = new StringBuilder();
                yield codeStream.doOnNext(codeBuilder::append).doOnComplete(() -> {
                    try {
                        String completeHtmlCode = codeBuilder.toString();
                        HtmlCodeResult htmlCodeResult = (HtmlCodeResult) CodeParserExecutor.executeParser(completeHtmlCode, CodeGenTypeEnum.HTML);
                        File savedDir = CodeFileSaverExecutor.executeSaver(htmlCodeResult, CodeGenTypeEnum.HTML, appId);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage());
                    }
                });
            }
            case MULTI_FILE -> {
                Flux<String> codeStream = aiCodeGeneratorService.generateMultiFileCodeStream(userMessage);
                StringBuilder codeBuilder = new StringBuilder();
                yield codeStream.doOnNext(codeBuilder::append).doOnComplete(() -> {
                    try {
                        String completeMultiFileCode = codeBuilder.toString();
                        MultiFileCodeResult multiFileResult = (MultiFileCodeResult) CodeParserExecutor.executeParser(completeMultiFileCode, CodeGenTypeEnum.MULTI_FILE);
                        File savedDir = CodeFileSaverExecutor.executeSaver(multiFileResult, CodeGenTypeEnum.MULTI_FILE, appId);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage());
                    }
                });
            }
            case VUE_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateVueProjectCodeStream(appId, userMessage);
                yield processTokenStreamWithCallback(tokenStream, appId, sseCallback, userId, user);
            }
            case REACT_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateReactProjectCodeStream(appId, userMessage);
                yield processTokenStreamWithCallback(tokenStream, appId, sseCallback, userId, user);
            }
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }

    /**
     * 将 TokenStream 转换为 Flux<String>，并传递工具调用信息
     *
     * @param tokenStream TokenStream 对象
     * @param appId       应用 ID
     * @param userId      用户 ID
     * @return Flux<String> 流式响应
     */
    private Flux<String> processTokenStream(TokenStream tokenStream, Long appId, Long userId) {
        return Flux.create(sink -> {
            // 使用 StringBuilder 实时接收内容
            StringBuilder contentBuilder = new StringBuilder();
            
            // 创建一个占位符 Disposable
            Disposable placeholderDisposable = Flux.never().subscribe();
            
            // 注册任务到任务管理器
            generationTaskManager.registerTask(appId, "CODE_GENERATION", placeholderDisposable, sink, userId, contentBuilder);
            
            // 添加取消处理器
            sink.onCancel(() -> {
                log.info("FluxSink 被取消，appId: {}", appId);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
            });
            
            tokenStream.onPartialResponse((String partialResponse) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                AiResponseMessage aiResponseMessage = new AiResponseMessage(partialResponse);
                sink.next(JSONUtil.toJsonStr(aiResponseMessage));
            }).onPartialToolExecutionRequest((index, toolExecutionRequest) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                ToolRequestMessage toolRequestMessage = new ToolRequestMessage(toolExecutionRequest);
                String json = JSONUtil.toJsonStr(toolRequestMessage);
                sink.next(json);
            }).onToolExecuted((ToolExecution toolExecution) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                ToolExecutedMessage toolExecutedMessage = new ToolExecutedMessage(toolExecution);
                sink.next(JSONUtil.toJsonStr(toolExecutedMessage));
            }).onCompleteResponse((ChatResponse response) -> {
                log.info("项目代码生成完成，appId: {}", appId);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                sink.complete();
            }).onError((Throwable error) -> {
                log.error("项目代码生成失败: {}", error.getMessage(), error);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                sink.error(error);
            }).start();
        });
    }

    /**
     * 将 TokenStream 转换为 Flux<String>，并传递工具调用信息（带SSE回调）
     *
     * @param tokenStream TokenStream 对象
     * @param appId       应用 ID
     * @param sseCallback SSE消息回调
     * @param userId      用户ID
     * @param user        用户信息
     * @return Flux<String> 流式响应
     */
    private Flux<String> processTokenStreamWithCallback(TokenStream tokenStream, Long appId, Consumer<String> sseCallback, Long userId, User user) {
        return Flux.create(sink -> {
            // 重置中断标志
            resetInterrupt(appId);
            
            // 使用 StringBuilder 实时接收内容
            StringBuilder contentBuilder = new StringBuilder();
            
            // 创建一个占位符 Disposable
            Disposable placeholderDisposable = Flux.never().subscribe();
            
            // 注册任务到任务管理器
            generationTaskManager.registerTask(appId, "CODE_GENERATION", placeholderDisposable, sink, userId, contentBuilder);
            
            // 添加取消处理器
            sink.onCancel(() -> {
                log.info("FluxSink 被取消，appId: {}", appId);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
            });
            
            tokenStream.onPartialResponse((String partialResponse) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                contentBuilder.append(partialResponse);
                
                if (sseCallback != null) {
                    sseCallback.accept(partialResponse);
                }
                sink.next(partialResponse);
                
                // 通过 WebSocket 广播 AI 回复给所有协同编辑的用户
                try {
                    AppEditHandler appEditHandler = applicationContext.getBean(AppEditHandler.class);
                    appEditHandler.broadcastAiResponse(appId, user, partialResponse);
                } catch (Exception e) {
                    log.error("广播 AI 回复失败: {}", e.getMessage(), e);
                }
            }).onPartialToolExecutionRequest((index, toolExecutionRequest) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                ToolRequestMessage toolRequestMessage = new ToolRequestMessage(toolExecutionRequest);
                String json = JSONUtil.toJsonStr(toolRequestMessage);
                if (sseCallback != null) {
                    sseCallback.accept(json);
                }
                sink.next(json);
            }).onToolExecuted((ToolExecution toolExecution) -> {
                // 检查是否被中断
                if (isInterrupted(appId)) {
                    log.info("检测到中断信号，停止流式输出，appId: {}", appId);
                    // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                    sink.complete();
                    return;
                }
                
                ToolExecutedMessage toolExecutedMessage = new ToolExecutedMessage(toolExecution);
                String json = JSONUtil.toJsonStr(toolExecutedMessage);
                if (sseCallback != null) {
                    sseCallback.accept(json);
                }
                sink.next(json);
            }).onCompleteResponse((ChatResponse response) -> {
                log.info("项目代码生成完成，appId: {}", appId);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                sink.complete();
            }).onError((Throwable error) -> {
                log.error("项目代码生成失败: {}", error.getMessage(), error);
                // 完成任务
                generationTaskManager.completeTask(appId, contentBuilder, userId);
                sink.error(error);
            }).start();
        });
    }


}


