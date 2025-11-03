package com.mashang.aicode.web.model.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

/**
 * 对话历史 表定义层。
 */
public class ChatHistoryTableDef extends TableDef {

    /**
     * 对话历史
     */
    public static final ChatHistoryTableDef CHAT_HISTORY = new ChatHistoryTableDef();

    /**
     * id
     */
    public final QueryColumn ID = new QueryColumn(this, "id");

    /**
     * 应用id
     */
    public final QueryColumn APP_ID = new QueryColumn(this, "appId");

    /**
     * 用户id
     */
    public final QueryColumn USER_ID = new QueryColumn(this, "userId");

    /**
     * 消息类型：user/ai/error
     */
    public final QueryColumn MESSAGE_TYPE = new QueryColumn(this, "messageType");

    /**
     * 消息内容
     */
    public final QueryColumn MESSAGE_CONTENT = new QueryColumn(this, "messageContent");

    /**
     * 错误信息（仅当messageType为error时有效）
     */
    public final QueryColumn ERROR_INFO = new QueryColumn(this, "errorInfo");

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
     * 所有字段。
     */
    public final QueryColumn ALL_COLUMNS = new QueryColumn(this, "*");

    /**
     * 默认字段，不包含逻辑删除或者大量字段。
     */
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{ID, APP_ID, USER_ID, MESSAGE_TYPE, MESSAGE_CONTENT, ERROR_INFO, CREATE_TIME, UPDATE_TIME};

    public ChatHistoryTableDef() {
        super("", "chat_history");
    }
}