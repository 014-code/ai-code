package com.mashang.aicode.web.ai.core;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * ai文件保存类
 */
public class CodeFileSaver {

    //输出路径
    private static final String FILE_SAVE_ROOT_DIR = System.getProperty("user.dir") + File.separator + "tmp" + File.separator + "code_output";


    //1.创建文件夹方法
    //2.写结果到文件里面方法
    //3.保存多文件方法 + 保存单文件方法

    /**
     * 创建文件夹方法
     *
     * @param bizType
     * @return
     */
    private static String buildUniqueDir(String bizType, Long appId) {
        if (appId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        }
        String uniqueDirName = StrUtil.format("{}_{}", bizType, appId);
        String dirPath = FILE_SAVE_ROOT_DIR + File.separator + uniqueDirName;
        FileUtil.mkdir(dirPath);
        return dirPath;
    }

    /**
     * 写结果到文件里面方法
     *
     * @param fileName
     * @param filePath
     * @param content
     */
    private static void writeFile(String fileName, String filePath, String content) {
        //拼接File.separator通用分隔符
        String file = filePath + File.separator + fileName;
        try {
            // 使用Hutool的FileUtil.writeString方法
            FileUtil.writeString(content, file, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 保存单文件方法
     *
     * @param result
     * @return
     */
    public static File saveHtmlCodeResult(HtmlCodeResult result, Long appId) {
        String baseDirPath = buildUniqueDir(CodeGenTypeEnum.HTML.getValue(), appId);
        writeFile("index.html", baseDirPath, result.getHtmlCode());
        return new File(baseDirPath);
    }

    /**
     * 保存多文件方法
     *
     * @param result
     * @return
     */
    public static File saveMultiFileCodeResult(MultiFileCodeResult result, Long appId) {
        String baseDirPath = buildUniqueDir(CodeGenTypeEnum.MULTI_FILE.getValue(), appId);
        writeFile("index.html", baseDirPath, result.getHtmlCode());
        writeFile("style.css", baseDirPath, result.getCssCode());
        writeFile("script.js", baseDirPath, result.getJsCode());
        return new File(baseDirPath);
    }
}
