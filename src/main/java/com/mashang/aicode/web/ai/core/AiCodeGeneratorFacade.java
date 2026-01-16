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
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import dev.langchain4j.model.chat.response.ChatResponse;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.tool.ToolExecution;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.File;
import java.util.Map;
import java.util.function.Consumer;

/**
 * ai生成代码门面类
 */
@Service
@Slf4j
public class AiCodeGeneratorFacade {

    @Resource
    private AiCodeGeneratorServiceFactory aiCodeGeneratorServiceFactory;


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


    private File generateAndSaveHtmlCode(String userMessage, Long appId) {
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId);
        HtmlCodeResult result = aiCodeGeneratorService.generateHtmlCode(Math.toIntExact(appId), userMessage);
        return CodeFileSaverExecutor.executeSaver(result, CodeGenTypeEnum.HTML, appId);
    }


    private File generateAndSaveMultiFileCode(String userMessage, Long appId) {
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId);
        MultiFileCodeResult result = aiCodeGeneratorService.generateMultiFileCode(userMessage);
        return CodeFileSaverExecutor.executeSaver(result, CodeGenTypeEnum.MULTI_FILE, appId);
    }

    /**
     * ai单文件流式返回
     *
     * @param userMessage
     * @return
     */
    private Flux<String> generateAndSaveHtmlCodeStream(String userMessage, Long appId) {
        AiCodeGeneratorService aiCodeGeneratorService = aiCodeGeneratorServiceFactory.getAiCodeGeneratorService(appId);
        Flux<String> result = aiCodeGeneratorService.generateHtmlCodeStream(userMessage);

        StringBuilder codeBuilder = new StringBuilder();
        return result.doOnNext(codeBuilder::append).doOnComplete(() -> {

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

    /**
     * 统一流式返回方法
     *
     * @param userMessage
     * @param codeGenTypeEnum
     * @param appId
     * @return
     */
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId) {
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
                yield processTokenStream(tokenStream, appId);
            }
            case REACT_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateReactProjectCodeStream(appId, userMessage);
                yield processTokenStream(tokenStream, appId);
            }
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }

    /**
     * 统一流式返回方法（带SSE回调）
     *
     * @param userMessage
     * @param codeGenTypeEnum
     * @param appId
     * @param sseCallback SSE消息回调
     * @return
     */
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId, Consumer<String> sseCallback) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
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
                        log.error("保存失败: {}", e.getMessage());
                    }
                });
            }
            case VUE_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateVueProjectCodeStream(appId, userMessage);
                yield processTokenStreamWithCallback(tokenStream, appId, sseCallback);
            }
            case REACT_PROJECT -> {
                TokenStream tokenStream = aiCodeGeneratorService.generateReactProjectCodeStream(appId, userMessage);
                yield processTokenStreamWithCallback(tokenStream, appId, sseCallback);
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
     * @return Flux<String> 流式响应
     */
    private Flux<String> processTokenStream(TokenStream tokenStream, Long appId) {
        return Flux.create(sink -> {
            tokenStream.onPartialResponse((String partialResponse) -> {
                        AiResponseMessage aiResponseMessage = new AiResponseMessage(partialResponse);
                        sink.next(JSONUtil.toJsonStr(aiResponseMessage));
                    })
                    .onPartialToolExecutionRequest((index, toolExecutionRequest) -> {
                        ToolRequestMessage toolRequestMessage = new ToolRequestMessage(toolExecutionRequest);
                        String json = JSONUtil.toJsonStr(toolRequestMessage);
                        sink.next(json);
                    })
                    .onToolExecuted((ToolExecution toolExecution) -> {
                        ToolExecutedMessage toolExecutedMessage = new ToolExecutedMessage(toolExecution);
                        sink.next(JSONUtil.toJsonStr(toolExecutedMessage));
                    })
                    .onCompleteResponse((ChatResponse response) -> {
                        log.info("项目代码生成完成，appId: {}", appId);
                        sink.complete();
                    })
                    .onError((Throwable error) -> {
                        log.error("项目代码生成失败: {}", error.getMessage(), error);
                        sink.error(error);
                    })
                    .start();
        });
    }

    /**
     * 将 TokenStream 转换为 Flux<String>，并传递工具调用信息（带SSE回调）
     *
     * @param tokenStream TokenStream 对象
     * @param appId       应用 ID
     * @param sseCallback SSE消息回调
     * @return Flux<String> 流式响应
     */
    private Flux<String> processTokenStreamWithCallback(TokenStream tokenStream, Long appId, Consumer<String> sseCallback) {
        return Flux.create(sink -> {
            log.info("processTokenStreamWithCallback called, appId: {}, sseCallback: {}", appId, sseCallback != null);
            tokenStream.onPartialResponse((String partialResponse) -> {
                        log.info("onPartialResponse called, partialResponse: {}", partialResponse);
                        if (sseCallback != null) {
                            sseCallback.accept(partialResponse);
                        }
                        sink.next(partialResponse);
                    })
                    .onPartialToolExecutionRequest((index, toolExecutionRequest) -> {
                        log.info("onPartialToolExecutionRequest called, index: {}, toolName: {}, arguments: {}", index, toolExecutionRequest.name(), toolExecutionRequest.arguments());
                        ToolRequestMessage toolRequestMessage = new ToolRequestMessage(toolExecutionRequest);
                        String json = JSONUtil.toJsonStr(toolRequestMessage);
                        log.info("Sending tool request message: {}", json);
                        log.info("sseCallback是否为null: {}", sseCallback == null);
                        if (sseCallback != null) {
                            log.info("正在调用sseCallback.accept()");
                            sseCallback.accept(json);
                            log.info("sseCallback.accept()调用完成");
                        } else {
                            log.warn("sseCallback为null，无法发送SSE消息");
                        }
                        sink.next(json);
                    })
                    .onToolExecuted((ToolExecution toolExecution) -> {
                        log.info("onToolExecuted called, toolName: {}", toolExecution.request().name());
                        ToolExecutedMessage toolExecutedMessage = new ToolExecutedMessage(toolExecution);
                        String json = JSONUtil.toJsonStr(toolExecutedMessage);
                        if (sseCallback != null) {
                            sseCallback.accept(json);
                        }
                        sink.next(json);
                    })
                    .onCompleteResponse((ChatResponse response) -> {
                        log.info("项目代码生成完成，appId: {}", appId);
                        sink.complete();
                    })
                    .onError((Throwable error) -> {
                        log.error("项目代码生成失败: {}", error.getMessage(), error);
                        sink.error(error);
                    })
                    .start();
        });
    }


}


