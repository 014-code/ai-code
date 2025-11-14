package com.mashang.aicode.web.model.enums;

import cn.hutool.core.util.ObjUtil;
import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 应用类型枚举
 */
@Getter
public enum AppTypeEnum {
    // ========== 基础状态类型 (1-99) ==========
    NORMAL("正常应用", 1, "base"),
    FEATURED("精选应用", 2, "base"),
    RECOMMEND("推荐应用", 3, "base"),
    HOT("热门应用", 4, "base"),
    NEW("最新应用", 5, "base"),
    OFFICIAL("官方应用", 6, "base"),

    // ========== 技术平台类型 (100-199) ==========
    WEB_APP("Web应用", 100, "platform"),
    MOBILE_APP("移动应用", 101, "platform"),
    DESKTOP_APP("桌面应用", 102, "platform"),
    MINI_PROGRAM("小程序", 103, "platform"),
    H5_APP("H5应用", 104, "platform"),
    PWA_APP("PWA应用", 105, "platform"),
    WEBSITE("网站", 106, "platform"),
    ADMIN("管理系统", 107, "platform"),

    // ========== 行业领域类型 (200-299) ==========
    // 电商零售
    ECOMMERCE("电商平台", 200, "industry"),
    RETAIL("零售系统", 201, "industry"),
    O2O("O2O平台", 202, "industry"),
    GROUP_BUY("团购系统", 203, "industry"),
    LIVE_COMMERCE("直播电商", 204, "industry"),

    // 企业服务
    ENTERPRISE_OA("企业OA", 210, "industry"),
    CRM("客户关系管理", 211, "industry"),
    ERP("企业资源计划", 212, "industry"),
    HR_SYSTEM("人力资源", 213, "industry"),
    PROJECT_MGMT("项目管理", 214, "industry"),
    DOCUMENT_MGMT("文档管理", 215, "industry"),

    // 金融服务
    FIN_TECH("金融科技", 220, "industry"),
    PAYMENT("支付系统", 221, "industry"),
    INSURANCE("保险服务", 222, "industry"),
    WEALTH_MGMT("财富管理", 223, "industry"),
    BLOCKCHAIN("区块链应用", 224, "industry"),

    // 教育文化
    EDUCATION("在线教育", 230, "industry"),
    KNOWLEDGE("知识付费", 231, "industry"),
    TRAINING("培训系统", 232, "industry"),
    EXAM_SYSTEM("考试系统", 233, "industry"),
    EBOOK("电子书平台", 234, "industry"),

    // 医疗健康
    HEALTHCARE("医疗健康", 240, "industry"),
    HOSPITAL("医院管理", 241, "industry"),
    FITNESS("健身运动", 242, "industry"),
    MENTAL_HEALTH("心理健康", 243, "industry"),

    // 社交娱乐
    SOCIAL("社交网络", 250, "industry"),
    COMMUNITY("社区论坛", 251, "industry"),
    DATING("交友应用", 252, "industry"),
    CONTENT("内容创作", 253, "industry"),
    VIDEO("视频平台", 254, "industry"),
    MUSIC("音乐平台", 255, "industry"),
    GAME("游戏平台", 256, "industry"),

    // 生活服务
    TRAVEL("旅游出行", 260, "industry"),
    FOOD_DELIVERY("外卖点餐", 261, "industry"),
    REAL_ESTATE("房产服务", 262, "industry"),
    AUTOMOTIVE("汽车服务", 263, "industry"),
    WEATHER("天气服务", 264, "industry"),

    // 政府公共
    GOVERNMENT("政务服务", 270, "industry"),
    SMART_CITY("智慧城市", 271, "industry"),
    PUBLIC_SERVICE("公共服务", 272, "industry"),

    // ========== 功能模块类型 (300-399) ==========
    DATA_ANALYSIS("数据分析", 300, "function"),
    DATA_VIZ("数据可视化", 301, "function"),
    BI_SYSTEM("商业智能", 302, "function"),
    REPORT_SYSTEM("报表系统", 303, "function"),

    MESSAGE_SYSTEM("消息系统", 310, "function"),
    NOTIFICATION("通知中心", 311, "function"),
    CHAT("聊天系统", 312, "function"),

    SEARCH("搜索系统", 320, "function"),
    PERSONALIZATION("个性化推荐", 322, "function"),

    // ========== 技术组件类型 (400-499) ==========
    UI_COMPONENT("UI组件", 400, "component"),
    CHART_COMPONENT("图表组件", 401, "component"),
    FORM_COMPONENT("表单组件", 402, "component"),
    MAP_COMPONENT("地图组件", 403, "component");

    private final String text;
    private final Integer code;
    private final String category;

    AppTypeEnum(String text, Integer code, String category) {
        this.text = text;
        this.code = code;
        this.category = category;
    }

    // ========== 工具方法 ==========

    public static AppTypeEnum getByCode(Integer code) {
        if (ObjUtil.isEmpty(code)) {
            return null;
        }
        return Arrays.stream(values())
                .filter(e -> e.getCode().equals(code))
                .findFirst()
                .orElse(null);
    }

    public static AppTypeEnum getByText(String text) {
        if (ObjUtil.isEmpty(text)) {
            return null;
        }
        return Arrays.stream(values())
                .filter(e -> e.getText().equals(text))
                .findFirst()
                .orElse(null);
    }

    /**
     * 根据分类获取枚举列表
     */
    public static List<AppTypeEnum> getByCategory(String category) {
        return Arrays.stream(values())
                .filter(e -> e.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    /**
     * 获取所有分类
     */
    public static List<String> getAllCategories() {
        return Arrays.stream(values())
                .map(AppTypeEnum::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * 获取行业类型列表
     */
    public static List<AppTypeEnum> getIndustryTypes() {
        return getByCategory("industry");
    }

    /**
     * 获取平台类型列表
     */
    public static List<AppTypeEnum> getPlatformTypes() {
        return getByCategory("platform");
    }

    /**
     * 获取功能类型列表
     */
    public static List<AppTypeEnum> getFunctionTypes() {
        return getByCategory("function");
    }

    /**
     * 判断是否为行业应用
     */
    public boolean isIndustryType() {
        return "industry".equals(this.category);
    }

    /**
     * 判断是否为平台类型
     */
    public boolean isPlatformType() {
        return "platform".equals(this.category);
    }

    /**
     * 判断是否为功能模块
     */
    public boolean isFunctionType() {
        return "function".equals(this.category);
    }

    /**
     * 判断是否为组件类型
     */
    public boolean isComponentType() {
        return "component".equals(this.category);
    }

    /**
     * 判断是否为模板类型
     */
    public boolean isTemplateType() {
        return "template".equals(this.category);
    }

    /**
     * 获取分类显示名称
     */
    public String getCategoryName() {
        switch (this.category) {
            case "base":
                return "基础类型";
            case "platform":
                return "技术平台";
            case "industry":
                return "行业领域";
            case "function":
                return "功能模块";
            case "component":
                return "技术组件";
            case "template":
                return "模板类型";
            case "status":
                return "状态类型";
            default:
                return "其他";
        }
    }
    }