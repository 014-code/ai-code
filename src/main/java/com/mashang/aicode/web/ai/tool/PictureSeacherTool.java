package com.mashang.aicode.web.ai.tool;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.model.vo.PictureVO;
import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class PictureSeacherTool extends BaseTool {

    @Cacheable(
            value = "tool-results",
            key = "'pictureSearch:' + #title + ':' + #current",
            unless = "#result == null || #result.isEmpty()",
            cacheManager = "longTtlCacheManager"
    )
    @Tool("搜索Bing图片，用于网站内容展示")
    public List<PictureVO> searchPictures(
            @P("搜索关键词") String title,
            @P("当前页码，默认1") Integer current
    ) {
        if (current == null) {
            current = 1;
        }

        String url = "https://cn.bing.com/images/search?q=" + title + "&first=" + current;

        List<PictureVO> pictureVOS = new ArrayList<>();
        Document doc = null;

        try {
            doc = Jsoup.connect(url)
                    .timeout(10000)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .get();

            if (doc == null) {
                log.warn("无法获取网页内容: {}", url);
                return pictureVOS;
            }

            Elements newsHeadlines = doc.select(".iuscp.isv");
            for (Element headline : newsHeadlines) {
                try {
                    String m = headline.select(".iusc").get(0).attr("m");
                    Map<String, Object> bean = JSONUtil.toBean(m, Map.class);
                    String murl = (String) bean.get("murl");

                    String imgTitle = headline.select(".inflnk").get(0).attr("aria-label");
                    PictureVO picture = new PictureVO();
                    picture.setPictureTitle(imgTitle);
                    picture.setPictureUrl(murl);
                    pictureVOS.add(picture);
                } catch (Exception e) {
                    log.warn("解析图片元素失败: {}", e.getMessage());
                }
            }

            log.info("搜索Bing图片成功: 关键词={}, 页码={}, 结果数={}",
                    title, current, pictureVOS.size());

        } catch (IOException e) {
            log.error("图片抓取异常: {}", e.getMessage(), e);
        }

        return pictureVOS;
    }

    @Override
    public String getToolName() {
        return "searchPictures";
    }

    @Override
    public String getDisplayName() {
        return "搜索Bing图片";
    }

    @Override
    public String generateToolExecutedResult(JSONObject arguments) {
        String title = arguments.getStr("title");
        Integer current = arguments.getInt("current");

        StringBuilder result = new StringBuilder();
        result.append(String.format("[工具调用] %s\n", getDisplayName()));

        if (StrUtil.isNotBlank(title)) {
            result.append(String.format("- 搜索关键词: %s\n", title));
        }
        if (current != null) {
            result.append(String.format("- 页码: %d\n", current));
        }

        return result.toString();
    }
}
