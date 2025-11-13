package com.mashang.aicode.web.service;

import jakarta.servlet.http.HttpServletResponse;

import java.nio.file.Path;

public interface ProjectDownloadService {

    boolean isPathAllowed(Path projectRoot, Path fullPath);

    void downloadProjectAsZip(String projectPath, String downloadFileName, HttpServletResponse response);

}
