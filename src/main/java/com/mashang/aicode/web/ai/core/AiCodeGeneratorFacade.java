package com.mashang.aicode.web.ai.core;

import com.mashang.aicode.web.ai.AiCodeGeneratorService;
import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.File;

/**
 * ai生成代码门面类
 */
@Service
@Slf4j
public class AiCodeGeneratorFacade {

    @Resource
    private AiCodeGeneratorService aiCodeGeneratorService;


    public File generateAndSaveCode(String userMessage, CodeGenTypeEnum codeGenTypeEnum) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        return switch (codeGenTypeEnum) {
            case HTML -> generateAndSaveHtmlCode(userMessage);
            case MULTI_FILE -> generateAndSaveMultiFileCode(userMessage);
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }


    private File generateAndSaveHtmlCode(String userMessage) {
        HtmlCodeResult result = aiCodeGeneratorService.generateHtmlCode(userMessage);
        return CodeFileSaver.saveHtmlCodeResult(result);
    }


    private File generateAndSaveMultiFileCode(String userMessage) {
        MultiFileCodeResult result = aiCodeGeneratorService.generateMultiFileCode(userMessage);
        return CodeFileSaver.saveMultiFileCodeResult(result);
    }

    /**
     * ai单文件流式返回
     * @param userMessage
     * @return
     */
    private Flux<String> generateAndSaveHtmlCodeStream(String userMessage) {
        Flux<String> result = aiCodeGeneratorService.generateHtmlCodeStream(userMessage);

        StringBuilder codeBuilder = new StringBuilder();
        return result
                .doOnNext(chunk -> {

                    codeBuilder.append(chunk);
                })
                .doOnComplete(() -> {

                    try {
                        String completeHtmlCode = codeBuilder.toString();
                        HtmlCodeResult htmlCodeResult = CodeParser.parseHtmlCode(completeHtmlCode);

                        File savedDir = CodeFileSaver.saveHtmlCodeResult(htmlCodeResult);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage());
                    }
                });
    }

    /**
     * ai多文件流式返回
     * @param userMessage
     * @return
     */
    private Flux<String> generateAndSaveMultiFileCodeStream(String userMessage) {
        Flux<String> result = aiCodeGeneratorService.generateMultiFileCodeStream(userMessage);
        StringBuilder codeBuilder = new StringBuilder();
        return result
                .doOnNext(codeBuilder::append)
                .doOnComplete(() -> {
                    try {
                        String completeMultiFileCode = codeBuilder.toString();
                        log.info("AI返回的完整内容：{}", completeMultiFileCode);
                        MultiFileCodeResult multiFileResult = CodeParser.parseMultiFileCode(completeMultiFileCode);
                        log.info("解析结果 - HTML代码长度：{}", multiFileResult.getHtmlCode() != null ? multiFileResult.getHtmlCode().length() : 0);
                        log.info("解析结果 - CSS代码长度：{}", multiFileResult.getCssCode() != null ? multiFileResult.getCssCode().length() : 0);
                        log.info("解析结果 - JS代码长度：{}", multiFileResult.getJsCode() != null ? multiFileResult.getJsCode().length() : 0);
                        File savedDir = CodeFileSaver.saveMultiFileCodeResult(multiFileResult);
                        log.info("保存成功，路径为：" + savedDir.getAbsolutePath());
                    } catch (Exception e) {
                        log.error("保存失败: {}", e.getMessage(), e);
                    }
                });
    }

    /**
     * 统一流式返回方法
     * @param userMessage
     * @param codeGenTypeEnum
     * @return
     */
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        return switch (codeGenTypeEnum) {
            case HTML -> generateAndSaveHtmlCodeStream(userMessage);
            case MULTI_FILE -> generateAndSaveMultiFileCodeStream(userMessage);
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }




}


