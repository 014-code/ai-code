package com.mashang.aicode.web.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 对话历史 实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("chat_history")
public class ChatHistory implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 应用id
     */
    @TableField("appId")
    private Long appId;

    /**
     * 用户id
     */
    @TableField("userId")
    private Long userId;

    /**
     * 消息状态
     */
    @TableField("status")
    private String status;

    /**
     * 消息类型：user/ai/error
     */
    @TableField("messageType")
    private String messageType;

    /**
     * 消息内容
     */
    @TableField("messageContent")
    private String messageContent;

    /**
     * 创建时间
     */
    @TableField("createTime")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("updateTime")
    private LocalDateTime updateTime;

    /**
     * 是否删除
     */
    @TableLogic
    @TableField("isDelete")
    private Integer isDelete;
}