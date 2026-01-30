/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80100 (8.1.0)
 Source Host           : localhost:3306
 Source Schema         : ai_code

 Target Server Type    : MySQL
 Target Server Version : 80100 (8.1.0)
 File Encoding         : 65001

 Date: 20/01/2026 17:22:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ai_model_config
-- ----------------------------
-- 注意：该表已废弃，多模型支持已移除，保留此表定义仅用于向后兼容
-- 积分计算现在使用固定的配置，不再依赖此表
DROP TABLE IF EXISTS `ai_model_config`;
CREATE TABLE `ai_model_config`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `modelKey` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模型唯一标识',
  `modelName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模型名称',
  `provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提供商：openai/openrouter/iflow/dashscope',
  `baseUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'API基础URL',
  `tier` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '模型等级',
  `pointsPerKToken` int NOT NULL COMMENT '每1K token消耗积分',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '模型描述',
  `isEnabled` tinyint NULL DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
  `sortOrder` int NULL DEFAULT 0 COMMENT '排序顺序',
  `qualityScore` decimal(3, 2) NULL DEFAULT 1.00 COMMENT '质量系数，范围0.5-2.0，默认1.0',
  `successRate` decimal(5, 2) NULL DEFAULT NULL COMMENT '成功率，0-100',
  `avgTokenUsage` int NULL DEFAULT NULL COMMENT '平均Token使用量',
  `userRating` decimal(3, 2) NULL DEFAULT NULL COMMENT '用户评分，0-5',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `model_key`(`modelKey` ASC) USING BTREE,
  INDEX `idx_tier`(`tier` ASC) USING BTREE,
  INDEX `idx_provider`(`provider` ASC) USING BTREE,
  INDEX `idx_is_enabled`(`isEnabled` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI模型配置表（已废弃，保留仅用于向后兼容）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for app
-- ----------------------------
DROP TABLE IF EXISTS `app`;
CREATE TABLE `app`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `appName` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '应用名称',
  `cover` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '应用封面',
  `appType` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'app类型',
  `initPrompt` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '应用初始化的 prompt',
  `codeGenType` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '代码生成类型（枚举）',
  `deployKey` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '部署标识',
  `deployedTime` datetime NULL DEFAULT NULL COMMENT '部署时间',
  `priority` int NOT NULL DEFAULT 0 COMMENT '优先级',
  `userId` bigint NOT NULL COMMENT '创建用户id',
  `spaceId` bigint NULL DEFAULT NULL COMMENT '所属空间id',
  `pageViews` bigint NULL DEFAULT 0 COMMENT '浏览量',
  `editTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_deployKey`(`deployKey` ASC) USING BTREE,
  INDEX `idx_appName`(`appName` ASC) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_spaceId`(`spaceId` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2012841617930133507 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '应用' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for chat_history
-- ----------------------------
DROP TABLE IF EXISTS `chat_history`;
CREATE TABLE `chat_history`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `messageContent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '消息状态',
  `messageType` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'user/ai',
  `appId` bigint NOT NULL COMMENT '应用id',
  `userId` bigint NOT NULL COMMENT '创建用户id',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_appId`(`appId` ASC) USING BTREE,
  INDEX `idx_createTime`(`createTime` ASC) USING BTREE,
  INDEX `idx_appId_createTime`(`appId` ASC, `createTime` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2012849320459051010 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '对话历史' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for code_snippet
-- ----------------------------
DROP TABLE IF EXISTS `code_snippet`;
CREATE TABLE `code_snippet`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '片段ID',
  `snippetName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '代码片段名称',
  `snippetType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '代码片段类型',
  `snippetCategory` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '代码片段分类',
  `snippetDesc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '代码片段描述',
  `snippetCode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '代码片段内容',
  `usageScenario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '使用场景',
  `tags` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标签，逗号分隔',
  `isActive` tinyint NULL DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
  `priority` int NULL DEFAULT 0 COMMENT '优先级，数字越大优先级越高',
  `creatorId` bigint NULL DEFAULT NULL COMMENT '创建者ID',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type_category`(`snippetType` ASC, `snippetCategory` ASC) USING BTREE,
  INDEX `idx_tags`(`tags`(100) ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '代码片段模板表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `appId` bigint NOT NULL COMMENT '应用ID',
  `commentType` int NOT NULL DEFAULT 1 COMMENT '评论类型：1-应用评论, 2-论坛评论',
  `parentId` bigint NULL DEFAULT NULL COMMENT '父评论ID，如果是主评论则为null',
  `userId` bigint NOT NULL COMMENT '用户ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `likeCount` int NOT NULL DEFAULT 0 COMMENT '点赞数',
  `replyCount` int NOT NULL DEFAULT 0 COMMENT '回复数',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_appId`(`appId` ASC) USING BTREE,
  INDEX `idx_parentId`(`parentId` ASC) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_createTime`(`createTime` ASC) USING BTREE,
  INDEX `idx_likeCount`(`likeCount` ASC) USING BTREE,
  INDEX `idx_replyCount`(`replyCount` ASC) USING BTREE,
  INDEX `idx_appId_parentId`(`appId` ASC, `parentId` ASC) USING BTREE,
  INDEX `idx_commentType`(`commentType` ASC) USING BTREE,
  INDEX `idx_commentType_appId_parentId`(`commentType` ASC, `appId` ASC, `parentId` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 369746142501130241 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '评论' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for email_verification_code
-- ----------------------------
DROP TABLE IF EXISTS `email_verification_code`;
CREATE TABLE `email_verification_code`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `email` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱地址',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码类型:REGISTER-注册, RESET_PASSWORD-重置密码, LOGIN-登录',
  `expireTime` datetime NOT NULL COMMENT '过期时间',
  `verified` tinyint NULL DEFAULT 0 COMMENT '是否已使用:0-未使用, 1-已使用',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '逻辑删除:0-未删除,1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE,
  INDEX `idx_email_type`(`email` ASC, `type` ASC) USING BTREE,
  INDEX `idx_expire`(`expireTime` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '邮箱验证码表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for forum_post
-- ----------------------------
DROP TABLE IF EXISTS `forum_post`;
CREATE TABLE `forum_post`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子标题',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '帖子内容（富文本）',
  `appId` bigint NULL DEFAULT NULL COMMENT '关联的应用ID（可选）',
  `userId` bigint NOT NULL COMMENT '发布用户ID',
  `viewCount` int NOT NULL DEFAULT 0 COMMENT '浏览数',
  `likeCount` int NOT NULL DEFAULT 0 COMMENT '点赞数',
  `commentCount` int NOT NULL DEFAULT 0 COMMENT '评论数',
  `isPinned` tinyint NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_appId`(`appId` ASC) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_createTime`(`createTime` ASC) USING BTREE,
  INDEX `idx_likeCount`(`likeCount` ASC) USING BTREE,
  INDEX `idx_viewCount`(`viewCount` ASC) USING BTREE,
  INDEX `idx_isPinned`(`isPinned` ASC) USING BTREE,
  INDEX `idx_createTime_isPinned`(`createTime` ASC, `isPinned` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 368694475747868673 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '论坛帖子' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for friend_relation
-- ----------------------------
DROP TABLE IF EXISTS `friend_relation`;
CREATE TABLE `friend_relation`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `friendId` bigint NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_friend`(`userId` ASC, `friendId` ASC) USING BTREE,
  INDEX `idx_user`(`userId` ASC, `status` ASC) USING BTREE,
  INDEX `idx_friend`(`friendId` ASC, `status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 369629079119917057 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '好友关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for friend_request
-- ----------------------------
DROP TABLE IF EXISTS `friend_request`;
CREATE TABLE `friend_request`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `requesterId` bigint NOT NULL,
  `addresseeId` bigint NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_requester_addressee`(`requesterId` ASC, `addresseeId` ASC, `status` ASC) USING BTREE,
  INDEX `idx_requester`(`requesterId` ASC, `status` ASC) USING BTREE,
  INDEX `idx_addressee`(`addresseeId` ASC, `status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 369628190732775425 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '好友请求表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for invite_record
-- ----------------------------
DROP TABLE IF EXISTS `invite_record`;
CREATE TABLE `invite_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID（雪花算法）',
  `inviterId` bigint NOT NULL COMMENT '邀请人ID',
  `inviteeId` bigint NOT NULL COMMENT '被邀请人ID',
  `inviteCode` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邀请码',
  `registerIp` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '注册IP',
  `deviceId` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设备ID',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'PENDING' COMMENT '状态（PENDING:待确认, REGISTERED:已注册, REWARDED:已奖励）',
  `inviterPoints` int NULL DEFAULT 0 COMMENT '邀请人获得积分',
  `inviteePoints` int NULL DEFAULT 0 COMMENT '被邀请人获得积分',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `registerTime` datetime NULL DEFAULT NULL COMMENT '注册时间',
  `rewardTime` datetime NULL DEFAULT NULL COMMENT '奖励发放时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_inviteCode`(`inviteCode` ASC) USING BTREE,
  INDEX `idx_inviterId`(`inviterId` ASC) USING BTREE,
  INDEX `idx_inviteeId`(`inviteeId` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '邀请关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for points_record
-- ----------------------------
DROP TABLE IF EXISTS `points_record`;
CREATE TABLE `points_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID（雪花算法）',
  `userId` bigint NOT NULL COMMENT '用户ID',
  `points` int NOT NULL COMMENT '积分变动数量（正数为增加，负数为扣减）',
  `balance` int NOT NULL COMMENT '变动后余额',
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '积分类型（SIGN_IN:签到, REGISTER:注册, INVITE:邀请, GENERATE:生成应用, EXPIRE:过期）',
  `reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '变动原因描述',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'completed' COMMENT '状态：pending-待处理，completed-已完成，failed-失败，expired-已过期',
  `remainingPoints` int NULL DEFAULT NULL COMMENT '剩余积分（用于部分消费场景）',
  `modelKey` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '使用的模型key（已废弃，保留仅用于向后兼容）',
  `tokenCount` int NULL DEFAULT NULL COMMENT '消耗的token数量',
  `relatedId` bigint NULL DEFAULT NULL COMMENT '关联ID（如应用ID、邀请记录ID）',
  `expireTime` datetime NULL DEFAULT NULL COMMENT '积分过期时间',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_createTime`(`createTime` ASC) USING BTREE,
  INDEX `idx_expireTime`(`expireTime` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '积分明细表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sign_in_record
-- ----------------------------
DROP TABLE IF EXISTS `sign_in_record`;
CREATE TABLE `sign_in_record`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID（雪花算法）',
  `userId` bigint NOT NULL COMMENT '用户ID',
  `signInDate` date NOT NULL COMMENT '签到日期',
  `continuousDays` int NULL DEFAULT 1 COMMENT '连续签到天数',
  `pointsEarned` int NOT NULL COMMENT '本次签到获得积分',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_userId_date`(`userId` ASC, `signInDate` ASC) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_signInDate`(`signInDate` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '签到记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for space
-- ----------------------------
DROP TABLE IF EXISTS `space`;
CREATE TABLE `space`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '空间id',
  `spaceName` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '空间名称',
  `spaceType` tinyint NOT NULL DEFAULT 1 COMMENT '空间类型：1-个人空间，2-团队空间',
  `ownerId` bigint NOT NULL COMMENT '所有者id',
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '空间描述',
  `memberCount` int NULL DEFAULT 0 COMMENT '成员数量',
  `appCount` int NULL DEFAULT 0 COMMENT '应用数量',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isDelete` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ownerId`(`ownerId` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 369314979156369409 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '团队空间' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for space_user
-- ----------------------------
DROP TABLE IF EXISTS `space_user`;
CREATE TABLE `space_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `spaceId` bigint NOT NULL COMMENT '空间id',
  `userId` bigint NOT NULL COMMENT '用户id',
  `role` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'MEMBER' COMMENT '角色：OWNER-所有者，ADMIN-管理员，MEMBER-成员',
  `permissions` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '权限列表（逗号分隔）',
  `joinTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_space_user`(`spaceId` ASC, `userId` ASC) USING BTREE,
  INDEX `idx_userId`(`userId` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 369632735886110721 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '空间成员' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `userAccount` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号',
  `userPassword` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `userName` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户昵称',
  `userAvatar` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户头像',
  `userProfile` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户简介',
  `userEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户邮箱',
  `emailVerified` tinyint NULL DEFAULT 0 COMMENT '邮箱是否已验证：0-未验证，1-已验证',
  `userRole` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '用户角色：user/admin',
  `editTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_userAccount`(`userAccount` ASC) USING BTREE,
  INDEX `idx_userName`(`userName` ASC) USING BTREE,
  INDEX `idx_userEmail`(`userEmail` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2012758242770890754 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_points
-- ----------------------------
DROP TABLE IF EXISTS `user_points`;
CREATE TABLE `user_points`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID（雪花算法）',
  `userId` bigint NOT NULL COMMENT '用户ID',
  `totalPoints` int NULL DEFAULT 0 COMMENT '累计获得积分',
  `availablePoints` int NULL DEFAULT 0 COMMENT '当前可用积分',
  `frozenPoints` int NULL DEFAULT 0 COMMENT '冻结积分（预留，暂不使用）',
  `createTime` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NULL DEFAULT 0 COMMENT '逻辑删除（0-未删除，1-已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_userId`(`userId` ASC) USING BTREE,
  INDEX `idx_availablePoints`(`availablePoints` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户积分表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
