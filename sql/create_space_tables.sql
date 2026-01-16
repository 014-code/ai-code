-- 团队空间表
CREATE TABLE IF NOT EXISTS `space` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '空间id',
  `spaceName` varchar(128) NOT NULL COMMENT '空间名称',
  `spaceType` tinyint NOT NULL DEFAULT 1 COMMENT '空间类型：1-个人空间，2-团队空间',
  `ownerId` bigint NOT NULL COMMENT '所有者id',
  `description` varchar(512) NULL COMMENT '空间描述',
  `memberCount` int DEFAULT 0 COMMENT '成员数量',
  `appCount` int DEFAULT 0 COMMENT '应用数量',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`),
  INDEX `idx_ownerId`(`ownerId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '团队空间';

-- 空间成员表
CREATE TABLE IF NOT EXISTS `space_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `spaceId` bigint NOT NULL COMMENT '空间id',
  `userId` bigint NOT NULL COMMENT '用户id',
  `role` varchar(32) NOT NULL DEFAULT 'MEMBER' COMMENT '角色：OWNER-所有者，ADMIN-管理员，MEMBER-成员',
  `permissions` varchar(512) NULL COMMENT '权限列表（逗号分隔）',
  `joinTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_space_user`(`spaceId`, `userId`),
  INDEX `idx_userId`(`userId`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '空间成员';

-- 修改app表，添加spaceId字段
ALTER TABLE `app` ADD COLUMN `spaceId` bigint NULL COMMENT '所属空间id' AFTER `userId`;
ALTER TABLE `app` ADD INDEX `idx_spaceId`(`spaceId`);
