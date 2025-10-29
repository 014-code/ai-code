package com.mashang.aicode.web.model.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

/**
 * 用户 表定义层。
 */
public class UserTableDef extends TableDef {

    /**
     * 用户
     */
    public static final UserTableDef USER = new UserTableDef();

    /**
     * id
     */
    public final QueryColumn ID = new QueryColumn(this, "id");

    /**
     * 账号
     */
    public final QueryColumn USER_ACCOUNT = new QueryColumn(this, "userAccount");

    /**
     * 密码
     */
    public final QueryColumn USER_PASSWORD = new QueryColumn(this, "userPassword");

    /**
     * 用户昵称
     */
    public final QueryColumn USER_NAME = new QueryColumn(this, "userName");

    /**
     * 用户头像
     */
    public final QueryColumn USER_AVATAR = new QueryColumn(this, "userAvatar");

    /**
     * 用户简介
     */
    public final QueryColumn USER_PROFILE = new QueryColumn(this, "userProfile");

    /**
     * 用户角色：user/admin
     */
    public final QueryColumn USER_ROLE = new QueryColumn(this, "userRole");

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
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{ID, USER_ACCOUNT, USER_NAME, USER_AVATAR, USER_PROFILE, USER_ROLE, EDIT_TIME, CREATE_TIME, UPDATE_TIME};

    public UserTableDef() {
        super("", "user");
    }
}