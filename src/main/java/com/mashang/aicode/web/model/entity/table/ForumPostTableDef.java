package com.mashang.aicode.web.model.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

public class ForumPostTableDef extends TableDef {

    public static final ForumPostTableDef FORUM_POST = new ForumPostTableDef();

    public final QueryColumn ID = new QueryColumn(this, "id");

    public final QueryColumn TITLE = new QueryColumn(this, "title");

    public final QueryColumn CONTENT = new QueryColumn(this, "content");

    public final QueryColumn APP_ID = new QueryColumn(this, "appId");

    public final QueryColumn USER_ID = new QueryColumn(this, "userId");

    public final QueryColumn VIEW_COUNT = new QueryColumn(this, "viewCount");

    public final QueryColumn LIKE_COUNT = new QueryColumn(this, "likeCount");

    public final QueryColumn COMMENT_COUNT = new QueryColumn(this, "commentCount");

    public final QueryColumn IS_PINNED = new QueryColumn(this, "isPinned");

    public final QueryColumn CREATE_TIME = new QueryColumn(this, "createTime");

    public final QueryColumn UPDATE_TIME = new QueryColumn(this, "updateTime");

    public final QueryColumn IS_DELETE = new QueryColumn(this, "isDelete");

    public final QueryColumn ALL_COLUMNS = new QueryColumn(this, "*");

    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{ID, TITLE, CONTENT, APP_ID, USER_ID, VIEW_COUNT, LIKE_COUNT, COMMENT_COUNT, IS_PINNED, CREATE_TIME, UPDATE_TIME};

    public ForumPostTableDef() {
        super("", "forum_post");
    }
}
