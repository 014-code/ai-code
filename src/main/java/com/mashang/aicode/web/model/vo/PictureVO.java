package com.mashang.aicode.web.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 图片视图
 **/
@Data
public class PictureVO implements Serializable {

    /**
     * 图片id
     */
    private Long id;

    /**
     * 图片标题
     */
    private String pictureTitle;

    /**
     * 图片url
     */
    private String pictureUrl;


    private static final long serialVersionUID = 1L;
}