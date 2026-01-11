package com.mashang.aicode.web.model.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

/**
 * 评论 表定义层
 *
 * @author makejava
 */
public class CommentTableDef extends TableDef {

    /**
     * 评论
     */
    public static final CommentTableDef COMMENT = new CommentTableDef();

    /**
     * id
     */
    public final QueryColumn ID = new QueryColumn(this, "id");

    /**
     * 应用ID
     */
    public final QueryColumn APP_ID = new QueryColumn(this, "appId");

    /**
     * 父评论ID
     */
    public final QueryColumn PARENT_ID = new QueryColumn(this, "parentId");

    /**
     * 用户ID
     */
    public final QueryColumn USER_ID = new QueryColumn(this, "userId");

    /**
     * 评论内容
     */
    public final QueryColumn CONTENT = new QueryColumn(this, "content");

    /**
     * 点赞数
     */
    public final QueryColumn LIKE_COUNT = new QueryColumn(this, "likeCount");

    /**
     * 回复数
     */
    public final QueryColumn REPLY_COUNT = new QueryColumn(this, "replyCount");

    /**
     * 创建时间
     */
    public final QueryColumn CREATE_TIME = new QueryColumn(this, "createTime");

    /**
     * 更新时间
     */
    public final QueryColumn UPDATE_TIME = new QueryColumn(this, "updateTime");

    /**
     * 是否删除
     */
    public final QueryColumn IS_DELETE = new QueryColumn(this, "isDelete");

    /**
     * 所有字段
     */
    public final QueryColumn ALL_COLUMNS = new QueryColumn(this, "*");

    /**
     * 默认字段，不包含逻辑删除或者大量字段
     */
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{ID, APP_ID, PARENT_ID, USER_ID, CONTENT, LIKE_COUNT, REPLY_COUNT, CREATE_TIME, UPDATE_TIME};

    public CommentTableDef() {
        super("", "comment");
    }
}
