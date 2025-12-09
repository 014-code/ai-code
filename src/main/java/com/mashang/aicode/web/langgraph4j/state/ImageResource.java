package com.mashang.aicode.web.langgraph4j.state;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 图片资源类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageResource implements Serializable {


    private ImageCategoryEnum category;


    private String description;


    private String url;

    @Serial
    private static final long serialVersionUID = 1L;
}


