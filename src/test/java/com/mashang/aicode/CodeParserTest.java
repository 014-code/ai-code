package com.mashang.aicode;

import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
import com.mashang.aicode.web.ai.core.CodeParser;
import com.mashang.aicode.web.ai.model.HtmlCodeResult;
import com.mashang.aicode.web.ai.model.MultiFileCodeResult;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import reactor.core.publisher.Flux;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class CodeParserTest {

    @Autowired
    private AiCodeGeneratorFacade aiCodeGeneratorFacade;

    @Test
    void parseHtmlCode() {
        String codeContent = """
                随便写一段描述：
                html 格式
                <!DOCTYPE html>
                <html>
                <head>
                    <title>测试页面</title>

                </head>

                <body>
                    <h1>Hello World!</h1>

                </body>

                </html>

                随便写一段描述
                """;
        HtmlCodeResult result = CodeParser.parseHtmlCode(codeContent);
        assertNotNull(result);
        assertNotNull(result.getHtmlCode());
    }

    @Test
    void parseMultiFileCode() {
        String codeContent = """
                创建一个完整的网页：
                html 格式
                <!DOCTYPE html>
                <html>
                <head>
                    <title>多文件示例</title>

                    <link rel="stylesheet" href="style.css">
                </head>

                <body>
                    <h1>欢迎使用</h1>

                    <script src="script.js"></script>

                </body>

                </html>

                css 格式
                h1 {
                    color: blue;
                    text-align: center;
                }
                ```
                ```js
                console.log('页面加载完成');

                文件创建完成！
                """;
        MultiFileCodeResult result = CodeParser.parseMultiFileCode(codeContent);
        assertNotNull(result);
        assertNotNull(result.getHtmlCode());
        assertNotNull(result.getCssCode());
        assertNotNull(result.getJsCode());
    }

    @Test
    void generateAndSaveCodeStream() {
        Flux<String> codeStream = aiCodeGeneratorFacade.generateAndSaveCodeStream("任务记录网站，代码不超过100行", CodeGenTypeEnum.MULTI_FILE);

        List<String> result = codeStream.collectList().block();

        Assertions.assertNotNull(result);
        String completeContent = String.join("", result);
        Assertions.assertNotNull(completeContent);
    }


}


