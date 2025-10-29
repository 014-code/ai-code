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


    public File generateAndSaveCode(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        return switch (codeGenTypeEnum) {
            case HTML -> generateAndSaveHtmlCode(userMessage,  appId);
            case MULTI_FILE -> generateAndSaveMultiFileCode(userMessage,   appId);
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }


    private File generateAndSaveHtmlCode(String userMessage, Long appId) {
        HtmlCodeResult result = aiCodeGeneratorService.generateHtmlCode(userMessage);
        return CodeFileSaver.saveHtmlCodeResult(result,  appId);
    }


    private File generateAndSaveMultiFileCode(String userMessage, Long appId) {
        MultiFileCodeResult result = aiCodeGeneratorService.generateMultiFileCode(userMessage);
        return CodeFileSaver.saveMultiFileCodeResult(result,   appId);
    }

    /**
     * ai单文件流式返回
     * @param userMessage
     * @return
     */
    private Flux<String> generateAndSaveHtmlCodeStream(String userMessage, Long appId) {
        Flux<String> result = aiCodeGeneratorService.generateHtmlCodeStream(userMessage);

        StringBuilder codeBuilder = new StringBuilder();
        return result
                .doOnNext(codeBuilder::append)
                .doOnComplete(() -> {

                    try {
                        String completeHtmlCode = codeBuilder.toString();
                        HtmlCodeResult htmlCodeResult = CodeParser.parseHtmlCode(completeHtmlCode);

                        File savedDir = CodeFileSaver.saveHtmlCodeResult(htmlCodeResult,  appId);
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
    private Flux<String> generateAndSaveMultiFileCodeStream(String userMessage, Long appId) {
        Flux<String> result = aiCodeGeneratorService.generateMultiFileCodeStream(userMessage);
        StringBuilder codeBuilder = new StringBuilder();
        return result
                .doOnNext(codeBuilder::append)
                .doOnComplete(() -> {
                    try {
                        String completeMultiFileCode = codeBuilder.toString();
                        MultiFileCodeResult multiFileResult = CodeParser.parseMultiFileCode(completeMultiFileCode);
                        File savedDir = CodeFileSaver.saveMultiFileCodeResult(multiFileResult,   appId);
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
    public Flux<String> generateAndSaveCodeStream(String userMessage, CodeGenTypeEnum codeGenTypeEnum, Long appId) {
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "生成类型为空");
        }
        return switch (codeGenTypeEnum) {
            case HTML -> generateAndSaveHtmlCodeStream(userMessage,   appId);
            case MULTI_FILE -> generateAndSaveMultiFileCodeStream(userMessage,    appId);
            default -> {
                String errorMessage = "不支持的生成类型：" + codeGenTypeEnum.getValue();
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, errorMessage);
            }
        };
    }




}


