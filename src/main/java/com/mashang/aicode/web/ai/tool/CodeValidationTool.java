package com.mashang.aicode.web.ai.tool;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RuntimeUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.agent.tool.ToolMemoryId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 代码验证工具
 * 使用ESLint检查Vue/React项目代码质量
 */
@Slf4j
@Component
public class CodeValidationTool extends BaseTool {

    @Tool("验证Vue/React项目代码质量，检查语法错误、未定义变量等问题。建议在完成所有文件编写后调用此工具进行检查。")
    public String validateCode(
            @P("要验证的项目相对路径，通常为当前项目根目录，传入 '.' 即可")
            String projectPath,
            @P("要验证的项目类型，如果是vue项目则传入vue_project，如果是react项目则传入react_project")
            String projectType,
            @ToolMemoryId Long appId
    ) {
        try {
            // 获取项目目录
            String projectDirName;
            if (projectType.equals(CodeGenTypeEnum.VUE_PROJECT.getValue())) {
                projectDirName = "vue_project_" + appId;
            }else {
                projectDirName = "react_project_" + appId;
            }
                File projectDir = new File(AppConstant.CODE_OUTPUT_ROOT_DIR, projectDirName);

            if (!projectDir.exists()) {
                return "错误：项目目录不存在: " + projectDirName;
            }

            log.info("开始验证代码质量: {}", projectDir.getAbsolutePath());

            // 1. 检查并安装ESLint（如果需要）
            if (!ensureESLintInstalled(projectDir)) {
                return "错误：无法安装ESLint，请检查npm环境";
            }

            // 2. 执行ESLint检查
            String lintResult = runESLint(projectDir);

            if (lintResult == null) {
                return "代码验证通过，未发现错误。可以继续构建项目。";
            }

            return lintResult;

        } catch (Exception e) {
            log.error("代码验证失败: {}", e.getMessage(), e);
            return "代码验证失败: " + e.getMessage();
        }
    }

    /**
     * 确保ESLint已安装
     */
    private boolean ensureESLintInstalled(File projectDir) {
        try {
            File packageJson = new File(projectDir, "package.json");
            if (!packageJson.exists()) {
                log.warn("package.json 不存在，跳过ESLint检查");
                return false;
            }

            // 检查是否已有ESLint依赖
            String content = FileUtil.readString(packageJson, StandardCharsets.UTF_8);
            if (content.contains("\"eslint\"")) {
                log.info("ESLint已安装");
                return true;
            }

            // 自动添加ESLint配置
            JSONObject pkg = JSONUtil.parseObj(content);

            // 添加lint脚本
            JSONObject scripts = pkg.getJSONObject("scripts");
            if (scripts == null) {
                scripts = new JSONObject();
                pkg.set("scripts", scripts);
            }
            if (!scripts.containsKey("lint")) {
                scripts.set("lint", "eslint . --ext .vue,.js,.ts,.jsx,.tsx");
            }

            // 添加ESLint依赖
            JSONObject devDeps = pkg.getJSONObject("devDependencies");
            if (devDeps == null) {
                devDeps = new JSONObject();
                pkg.set("devDependencies", devDeps);
            }
            if (!devDeps.containsKey("eslint")) {
                // 判断是否为React项目
                boolean isReactProject = isReactProject(projectDir);
                
                if (isReactProject) {
                    // React项目依赖
                    devDeps.set("eslint", "^8.57.0");
                    devDeps.set("eslint-plugin-react", "^7.34.0");
                    devDeps.set("eslint-plugin-react-hooks", "^4.6.0");
                } else {
                    // Vue项目依赖
                    devDeps.set("eslint", "^8.57.0");
                    devDeps.set("eslint-plugin-vue", "^9.20.0");
                }

                // 写回文件
                FileUtil.writeString(JSONUtil.toJsonPrettyStr(pkg), packageJson, StandardCharsets.UTF_8);
                log.info("已添加ESLint配置到package.json");

                // 安装依赖
                log.info("安装ESLint依赖...");
                executeCommand(projectDir, "npm.cmd install", 120);
            }

            // 创建ESLint配置文件
            createESLintConfig(projectDir, pkg);

            return true;

        } catch (Exception e) {
            log.error("安装ESLint失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 判断是否为React项目
     */
    private boolean isReactProject(File projectDir) {
        try {
            File packageJson = new File(projectDir, "package.json");
            if (!packageJson.exists()) {
                return false;
            }

            String content = FileUtil.readString(packageJson, StandardCharsets.UTF_8);
            JSONObject pkg = JSONUtil.parseObj(content);

            // 检查依赖中是否包含react
            JSONObject dependencies = pkg.getJSONObject("dependencies");
            if (dependencies != null) {
                if (dependencies.containsKey("react")) {
                    return true;
                }
            }

            return false;

        } catch (Exception e) {
            log.error("判断项目类型失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 创建ESLint配置文件
     */
    private void createESLintConfig(File projectDir, JSONObject pkg) {
        File eslintrc = new File(projectDir, ".eslintrc.js");
        File eslintrcCjs = new File(projectDir, ".eslintrc.cjs");
        File eslintrcJson = new File(projectDir, ".eslintrc.json");

        // 如果已有配置文件，跳过
        if (eslintrc.exists() || eslintrcCjs.exists() || eslintrcJson.exists()) {
            return;
        }

        // 判断是否为React项目
        boolean isReactProject = isReactProject(projectDir);

        // 检查是否为ES Module项目
        boolean isESModule = "module".equals(pkg.getStr("type"));

        String config;
        File configFile;

        if (isReactProject) {
            // React项目配置
            config = """
                    module.exports = {
                      env: {
                        browser: true,
                        es2021: true,
                        node: true
                      },
                      extends: [
                        'eslint:recommended',
                        'plugin:react/recommended',
                        'plugin:react-hooks/recommended'
                      ],
                      parserOptions: {
                        ecmaVersion: 'latest',
                        sourceType: 'module',
                        ecmaFeatures: {
                          jsx: true
                        }
                      },
                      plugins: ['react', 'react-hooks'],
                      rules: {
                        'no-console': 'off',
                        'no-debugger': 'warn',
                        'react/react-in-jsx-scope': 'off',
                        'react/prop-types': 'off'
                      },
                      settings: {
                        react: {
                          version: 'detect'
                        }
                      }
                    };
                    """;
            // React项目使用 .eslintrc.js
            configFile = eslintrc;
        } else {
            // Vue项目配置
            config = """
                    module.exports = {
                      env: {
                        browser: true,
                        es2021: true,
                        node: true
                      },
                      extends: [
                        'eslint:recommended',
                        'plugin:vue/vue3-recommended'
                      ],
                      parserOptions: {
                        ecmaVersion: 'latest',
                        sourceType: 'module'
                      },
                      plugins: ['vue'],
                      rules: {
                        'no-console': 'off',
                        'no-debugger': 'warn',
                        'vue/multi-word-component-names': 'off'
                      }
                    };
                    """;
            // Vue项目根据是否为ES Module决定文件扩展名
            configFile = isESModule ? eslintrcCjs : eslintrc;
        }

        FileUtil.writeString(config, configFile, StandardCharsets.UTF_8);
        log.info("已创建ESLint配置文件: {} (项目类型: {})", configFile.getName(), isReactProject ? "React" : "Vue");
    }

    /**
     * 执行ESLint检查
     */
    private String runESLint(File projectDir) {
        try {
            File jsonOutput = new File(projectDir, "eslint-result.json");

            // 执行ESLint（JSON格式输出）
            String command = "npm.cmd run lint -- --format json --output-file " + jsonOutput.getName();
            executeCommand(projectDir, command, 60);

            // 读取结果
            if (!jsonOutput.exists()) {
                log.info("ESLint未生成输出文件，可能没有错误");
                return null;
            }

            String jsonContent = FileUtil.readString(jsonOutput, StandardCharsets.UTF_8);
            FileUtil.del(jsonOutput); // 删除临时文件

            if (jsonContent == null || jsonContent.trim().isEmpty()) {
                return null;
            }

            // 解析错误
            List<String> errors = parseESLintErrors(jsonContent);

            if (errors.isEmpty()) {
                return null; // 没有错误
            }

            // 格式化错误信息
            StringBuilder result = new StringBuilder();
            result.append("发现 ").append(errors.size()).append(" 个代码错误：\n\n");

            for (int i = 0; i < Math.min(errors.size(), 10); i++) {
                result.append(i + 1).append(". ").append(errors.get(i)).append("\n");
            }

            if (errors.size() > 10) {
                result.append("\n... 还有 ").append(errors.size() - 10).append(" 个错误未显示\n");
            }

            result.append("\n请修复这些错误后重新验证。");

            return result.toString();

        } catch (Exception e) {
            log.error("ESLint执行失败: {}", e.getMessage());
            return "ESLint执行失败: " + e.getMessage();
        }
    }

    /**
     * 解析ESLint JSON输出
     */
    private List<String> parseESLintErrors(String jsonContent) {
        List<String> errors = new ArrayList<>();

        try {
            JSONArray results = JSONUtil.parseArray(jsonContent);

            for (int i = 0; i < results.size(); i++) {
                JSONObject fileResult = results.getJSONObject(i);
                String filePath = fileResult.getStr("filePath");
                JSONArray messages = fileResult.getJSONArray("messages");

                if (messages == null || messages.isEmpty()) {
                    continue;
                }

                for (int j = 0; j < messages.size(); j++) {
                    JSONObject msg = messages.getJSONObject(j);

                    // 只处理error级别
                    int severity = msg.getInt("severity", 0);
                    if (severity != 2) {
                        continue;
                    }

                    String relativePath = getRelativePath(filePath);
                    int line = msg.getInt("line", 0);
                    int column = msg.getInt("column", 0);
                    String message = msg.getStr("message");
                    String rule = msg.getStr("ruleId");

                    String error = String.format("%s:%d:%d - %s (%s)",
                            relativePath, line, column, message, rule);
                    errors.add(error);
                }
            }

        } catch (Exception e) {
            log.error("解析ESLint结果失败: {}", e.getMessage());
        }

        return errors;
    }

    /**
     * 获取相对路径
     */
    private String getRelativePath(String fullPath) {
        if (fullPath.contains("src")) {
            return fullPath.substring(fullPath.indexOf("src"));
        }
        if (fullPath.contains("\\")) {
            String[] parts = fullPath.split("\\\\");
            if (parts.length > 0) {
                return parts[parts.length - 1];
            }
        }
        return fullPath;
    }

    /**
     * 执行命令
     */
    private void executeCommand(File workingDir, String command, int timeoutSeconds) throws Exception {
        log.info("执行命令: {} (工作目录: {})", command, workingDir.getAbsolutePath());

        Process process = RuntimeUtil.exec(null, workingDir, command.split("\\s+"));

        // 读取输出（避免缓冲区满）
        Thread.ofVirtual().start(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("[STDOUT] {}", line);
                }
            } catch (Exception e) {
                log.error("读取stdout失败", e);
            }
        });

        Thread.ofVirtual().start(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("[STDERR] {}", line);
                }
            } catch (Exception e) {
                log.error("读取stderr失败", e);
            }
        });

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("命令执行超时");
        }

        if (process.exitValue() != 0 && process.exitValue() != 1) {
            // exitValue=1 通常表示ESLint发现错误，这是预期的
            throw new RuntimeException("命令执行失败，退出码: " + process.exitValue());
        }
    }

    @Override
    public String getToolName() {
        return "validateCode";
    }

    @Override
    public String getDisplayName() {
        return "验证代码";
    }

    @Override
    public String generateToolExecutedResult(JSONObject arguments) {
        return String.format("\n\n[工具调用] %s\n\n", getDisplayName());
    }
}
