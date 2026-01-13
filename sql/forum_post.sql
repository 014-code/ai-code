-- 论坛帖子表
create table if not exists forum_post
(
    id          bigint auto_increment comment 'id' primary key,
    title       varchar(256)                       not null comment '帖子标题',
    content     longtext                           not null comment '帖子内容（富文本）',
    appId       bigint                             null comment '关联的应用ID（可选）',
    userId      bigint                             not null comment '发布用户ID',
    viewCount   int      default 0                 not null comment '浏览数',
    likeCount   int      default 0                 not null comment '点赞数',
    commentCount int     default 0                 not null comment '评论数',
    isPinned    tinyint  default 0                 not null comment '是否置顶',
    createTime  datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime  datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete    tinyint  default 0                 not null comment '是否删除',
    INDEX idx_appId (appId),                       -- 提升基于应用的查询性能
    INDEX idx_userId (userId),                     -- 提升基于用户的查询性能
    INDEX idx_createTime (createTime),             -- 提升基于时间的查询性能
    INDEX idx_likeCount (likeCount),               -- 提升基于点赞数的查询性能
    INDEX idx_viewCount (viewCount),               -- 提升基于浏览数的查询性能
    INDEX idx_isPinned (isPinned),                 -- 提升基于置顶的查询性能
    INDEX idx_createTime_isPinned (createTime, isPinned) -- 复合索引，用于分页查询
) comment '论坛帖子' collate = utf8mb4_unicode_ci;
