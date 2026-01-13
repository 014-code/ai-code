-- 修改论坛帖子表的 content 列类型为 longtext
-- 解决富文本内容过长导致的数据截断问题
ALTER TABLE forum_post MODIFY COLUMN content LONGTEXT NOT NULL COMMENT '帖子内容（富文本）';
