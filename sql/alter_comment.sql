-- 修改评论表，添加类型字段
-- commentType: 1-应用评论, 2-论坛评论

-- 添加类型字段
ALTER TABLE comment ADD COLUMN commentType int DEFAULT 1 NOT NULL COMMENT '评论类型：1-应用评论, 2-论坛评论' AFTER appId;

-- 添加类型字段的索引
ALTER TABLE comment ADD INDEX idx_commentType (commentType);

-- 修改复合索引，包含类型字段
ALTER TABLE comment ADD INDEX idx_commentType_appId_parentId (commentType, appId, parentId);

-- 更新现有数据，默认为应用评论
UPDATE comment SET commentType = 1 WHERE commentType IS NULL OR commentType = 0;
