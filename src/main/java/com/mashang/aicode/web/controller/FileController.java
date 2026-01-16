package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.manager.cos.CosManager;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/file")
@Slf4j
public class FileController {

    @Resource
    private CosManager cosManager;

    /**
     * 文件上传
     *
     * @param multipartFile 文件
     * @return 文件URL
     */
    @PostMapping("/upload")
    @AuthCheck(mustRole = UserConstant.DEFAULT_ROLE)
    public BaseResponse<String> uploadFile(@RequestParam("file") MultipartFile multipartFile) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件不能为空");
        }

        // 获取文件名和扩展名
        String originalFilename = multipartFile.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件名不能为空");
        }

        // 生成新的文件名（UUID + 原始扩展名）
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;

        // 生成文件存储路径（按日期分目录）
        String key = "avatar/" + newFilename;

        try {
            // 将MultipartFile转换为File
            File file = File.createTempFile("upload", extension);
            multipartFile.transferTo(file);

            // 上传到COS
            String url = cosManager.uploadFile(key, file);

            // 删除临时文件
            file.delete();

            if (url == null) {
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "文件上传失败");
            }

            return ResultUtils.success(url);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "文件上传失败");
        }
    }
}
