package com.mashang.aicode.web.model.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

/**
 * 应用 表定义层。
 */
public class AppTableDef extends TableDef {

    /**
     * 应用
     */
    public static final AppTableDef APP = new AppTableDef();

    /**
     * id
     */
    public final QueryColumn ID = new QueryColumn(this, "id");

    /**
     * 应用名称
     */
    public final QueryColumn APP_NAME = new QueryColumn(this, "appName");

    /**
     * 应用描述
     */
    public final QueryColumn APP_DESC = new QueryColumn(this, "appDesc");

    /**
     * 应用图标
     */
    public final QueryColumn APP_ICON = new QueryColumn(this, "appIcon");

    /**
     * 应用封面
     */
    public final QueryColumn APP_COVER = new QueryColumn(this, "appCover");

    /**
     * 初始化提示词
     */
    public final QueryColumn INIT_PROMPT = new QueryColumn(this, "initPrompt");

    /**
     * 创建用户 id
     */
    public final QueryColumn USER_ID = new QueryColumn(this, "userId");

    /**
     * 代码生成类型
     */
    public final QueryColumn CODE_GEN_TYPE = new QueryColumn(this, "codeGenType");

    /**
     * 优先级（越大越靠前）
     */
    public final QueryColumn PRIORITY = new QueryColumn(this, "priority");

    /**
     * 是否精选（0-否，1-是）
     */
    public final QueryColumn IS_FEATURED = new QueryColumn(this, "isFeatured");

    /**
     * 编辑时间
     */
    public final QueryColumn EDIT_TIME = new QueryColumn(this, "editTime");

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
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{ID, APP_NAME, APP_DESC, APP_ICON, APP_COVER, INIT_PROMPT, USER_ID, PRIORITY, IS_FEATURED, EDIT_TIME, CREATE_TIME, UPDATE_TIME};

    public AppTableDef() {
        super("", "app");
    }
}