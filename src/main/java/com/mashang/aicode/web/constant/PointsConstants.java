package com.mashang.aicode.web.constant;

/**
 * 积分系统常量
 *
 * @author system
 */
public class PointsConstants {

    /**
     * 积分兑换比例：1积分 = 1000 Token
     */
    public static final int TOKENS_PER_POINT = 1000;

    /**
     * 生成应用预扣积分（已废弃，请使用具体类型的常量）
     *
     * @deprecated 使用 HTML_GENERATE_POINTS、MULTI_FILE_GENERATE_POINTS、VUE_GENERATE_POINTS
     */
    @Deprecated
    public static final int GENERATE_PRE_DEDUCT = 6;

    /**
     * HTML 文件生成消耗积分
     */
    public static final int HTML_GENERATE_POINTS = 6;

    /**
     * 多文件项目生成消耗积分
     */
    public static final int MULTI_FILE_GENERATE_POINTS = 9;

    /**
     * Vue 项目生成消耗积分
     */
    public static final int VUE_GENERATE_POINTS = 15;

    /**
     * REACT 项目生成消耗积分
     */
    public static final int REACT_GENERATE_POINTS = 15;

    /**
     * 首次生成奖励积分
     */
    public static final int FIRST_GENERATE_REWARD = 50;

    /**
     * 新用户注册奖励积分
     */
    public static final int REGISTER_REWARD = 100;

    /**
     * 签到基础奖励积分
     */
    public static final int SIGN_IN_BASE = 5;

    /**
     * 连续签到3天额外奖励
     */
    public static final int SIGN_IN_3_DAYS_BONUS = 3;

    /**
     * 连续签到7天额外奖励
     */
    public static final int SIGN_IN_7_DAYS_BONUS = 10;

    /**
     * 连续签到30天额外奖励
     */
    public static final int SIGN_IN_30_DAYS_BONUS = 50;

    /**
     * 邀请用户注册 - 邀请人奖励
     */
    public static final int INVITE_REGISTER_INVITER_REWARD = 50;

    /**
     * 邀请用户注册 - 被邀请人奖励
     */
    public static final int INVITE_REGISTER_INVITEE_REWARD = 50;

    /**
     * 邀请用户首次生成 - 邀请人奖励
     */
    public static final int INVITE_FIRST_GEN_INVITER_REWARD = 50;

    /**
     * 邀请用户首次生成 - 被邀请人奖励
     */
    public static final int INVITE_FIRST_GEN_INVITEE_REWARD = 30;

    /**
     * 无效生成惩罚积分
     */
    public static final int INVALID_GENERATION_PENALTY = 10;

    /**
     * 积分有效期（天数）
     */
    public static final int POINTS_VALIDITY_DAYS = 90;

    /**
     * 积分到期提醒提前天数
     */
    public static final int POINTS_EXPIRE_REMIND_DAYS = 7;

    /**
     * 单日Token消耗上限
     */
    public static final int DAILY_TOKEN_LIMIT = 120000;

    /**
     * 单日生成次数上限
     */
    public static final int DAILY_GENERATION_LIMIT = 30;

    /**
     * 单日邀请奖励次数上限
     */
    public static final int DAILY_INVITE_REWARD_LIMIT = 3;

    /**
     * 邀请防刷检测窗口期（天数）
     */
    public static final int INVITE_ABUSE_CHECK_DAYS = 7;

    /**
     * 邀请奖励回收宽限期（天数）
     */
    public static final int INVITE_REWARD_GRACE_DAYS = 7;

    /**
     * 积分操作分布式锁超时时间（秒）
     */
    public static final int POINTS_LOCK_TIMEOUT_SECONDS = 10;

    /**
     * IP级别限流 - 每分钟请求次数
     */
    public static final int IP_RATE_LIMIT_PER_MINUTE = 10;

    /**
     * IP级别限流 - 时间窗口（秒）
     */
    public static final int IP_RATE_LIMIT_WINDOW_SECONDS = 60;

    /**
     * 根据生成类型获取所需积分
     *
     * @param genType 生成类型（html, multi_file, vue_project，react_project）
     * @return 所需积分数
     */
    public static int getPointsByGenType(String genType) {
        if (genType == null) {
            return HTML_GENERATE_POINTS; // 默认返回 HTML 的积分
        }
        switch (genType.toLowerCase()) {
            case "html":
                return HTML_GENERATE_POINTS;
            case "multi_file":
                return MULTI_FILE_GENERATE_POINTS;
            case "vue_project":
                return VUE_GENERATE_POINTS;
            case "react_project":
                return REACT_GENERATE_POINTS;
            default:
                return HTML_GENERATE_POINTS;
        }
    }

    private PointsConstants() {
        // 私有构造函数，防止实例化
    }
}
