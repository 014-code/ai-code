package com.mashang.aicode;

import com.mashang.aicode.web.langgraph4j.state.ImageCategoryEnum;
import com.mashang.aicode.web.langgraph4j.state.ImageResource;
import com.mashang.aicode.web.langgraph4j.tools.ImageSearchTool;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.skyscreamer.jsonassert.JSONAssert.assertEquals;

@SpringBootTest
class ImageSearchToolTest {

    @Resource
    private ImageSearchTool imageSearchTool;

    @Test
    void testSearchContentImages() {

        List<ImageResource> images = imageSearchTool.searchContentImages("technology");
        assertNotNull(images);
        assertFalse(images.isEmpty());

        ImageResource firstImage = images.get(0);
//        assertEquals(ImageCategoryEnum.CONTENT, firstImage.getCategory());
        assertNotNull(firstImage.getDescription());
        assertNotNull(firstImage.getUrl());
        assertTrue(firstImage.getUrl().startsWith("http"));
        System.out.println("搜索到 " + images.size() + " 张图片");
        images.forEach(image ->
                System.out.println("图片: " + image.getDescription() + " - " + image.getUrl())
        );
    }
}

