package com.mashang.aicode.web.controller;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.mashang.aicode.web.ai.factory.AiCodeGenTypeRoutingServiceFactory;
import com.mashang.aicode.web.ai.factory.AppNameServiceFactory;
import com.mashang.aicode.web.ai.service.AiCodeGenTypeRoutingService;
import com.mashang.aicode.web.ai.service.AppNameService;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.model.enums.AppTypeEnum;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.DeleteRequest;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.app.AppAddRequest;
import com.mashang.aicode.web.model.dto.app.AppDeployRequest;
import com.mashang.aicode.web.model.dto.app.AppQueryRequest;
import com.mashang.aicode.web.model.dto.app.AppUpdateRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.AppTypeEnum;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.enums.PresetPromptEnum;
import com.mashang.aicode.web.model.vo.AppTypeVO;
import com.mashang.aicode.web.model.vo.PresetPromptVO;
import com.mashang.aicode.web.ratelimiter.annotation.RateLimit;
import com.mashang.aicode.web.ratelimiter.enums.RateLimitType;
import com.mashang.aicode.web.service.*;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.mashang.aicode.web.utils.IpUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.File;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 应用 控制层。
 */
@RestController
@RequestMapping("/app")
@Slf4j
public class AppController {

    @Resource
    private AppService appService;

    @Resource
    private UserService userService;

    @Resource
    private ChatHistoryService chatHistoryService;

    @Resource
    private ProjectDownloadService projectDownloadService;
    @Resource
    private AiCodeGenTypeRoutingService aiCodeGenTypeRoutingService;
    @Resource
    private AiCodeGenTypeRoutingServiceFactory aiCodeGenTypeRoutingServiceFactory;
    @Resource
    private AppNameServiceFactory appNameServiceFactory;
    @Resource
    private SpaceUserService spaceUserService;

    @Resource
    private IpUtils ipUtils;


    /**
     * 下载项目
     *
     * @param appId
     * @param request
     * @param response
     */
    @GetMapping("/download/{appId}")
    public void downloadAppCode(@PathVariable Long appId, HttpServletRequest request, HttpServletResponse response) {

        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID无效");
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");
        User loginUser = userService.getLoginUser(request);
        if (!app.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限下载该应用代码");
        }
        String codeGenType = app.getCodeGenType();
        String sourceDirName = codeGenType + "_" + appId;
        String sourceDirPath = AppConstant.CODE_OUTPUT_ROOT_DIR + File.separator + sourceDirName;
        File sourceDir = new File(sourceDirPath);
        ThrowUtils.throwIf(!sourceDir.exists() || !sourceDir.isDirectory(), ErrorCode.NOT_FOUND_ERROR, "应用代码不存在，请先生成代码");
        String downloadFileName = String.valueOf(appId);
        projectDownloadService.downloadProjectAsZip(sourceDirPath, downloadFileName, response);
    }


    /**
     * 【用户】创建应用
     */
    @PostMapping("/add")
    public BaseResponse<Long> addApp(@RequestBody AppAddRequest appAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(appAddRequest == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        String initPrompt = appAddRequest.getInitPrompt();
        ThrowUtils.throwIf(StrUtil.isBlank(initPrompt), ErrorCode.PARAMS_ERROR, "初始化提示词不能为空");

        // 名称，使用 AI 自动生成
        AppNameService appNameService = appNameServiceFactory.createAppNameService();
        String appName = appNameService.generateAppName(initPrompt);
        log.info("AI 自动生成应用名称: {}", appName);

        // 创建应用
        App app = new App();
        BeanUtil.copyProperties(appAddRequest, app);
        app.setUserId(loginUser.getId());
        app.setAppName(appName);
        app.setSpaceId(appAddRequest.getSpaceId());
//        app.setPriority(0); // 默认非精选
        app.setPriority(0); // 默认优先级
        //ai自动选择应用类型
        AppTypeEnum appTypeEnum = aiCodeGenTypeRoutingService.routeAppType(appAddRequest.getAppName(), initPrompt);
        app.setAppType(appTypeEnum.getText());
        //ai自动选择生成模式
        AiCodeGenTypeRoutingService routingService = aiCodeGenTypeRoutingServiceFactory.createAiCodeGenTypeRoutingService();
        CodeGenTypeEnum selectedCodeGenType = routingService.routeCodeGenType(initPrompt);
        app.setCodeGenType(selectedCodeGenType.getValue());

        app.setIsDelete(0);

        boolean result = appService.save(app);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(app.getId());
    }

    /**
     * 【用户】根据 id 修改自己的应用（目前只支持修改应用名称）
     */
    @PostMapping("/update/user")
    public BaseResponse<Boolean> updateApp(@RequestBody AppUpdateRequest appUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(appUpdateRequest == null || appUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 查询应用
        App app = appService.getById(appUpdateRequest.getId());
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR);

        // 校验权限（只能修改自己的应用）
        ThrowUtils.throwIf(!app.getUserId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        // 更新应用名称
        App updateApp = new App();
        updateApp.setId(appUpdateRequest.getId());
        updateApp.setAppName(appUpdateRequest.getAppName());
        updateApp.setEditTime(new Date());

        boolean result = appService.updateById(updateApp);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【用户】根据 id 删除自己的应用（同时删除关联的对话历史）
     */
    @PostMapping("/delete/user")
    public BaseResponse<Boolean> deleteApp(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(deleteRequest == null || deleteRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 删除应用（同时删除关联的对话历史）
        boolean result = appService.deleteApp(deleteRequest.getId(), loginUser);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【用户】根据 id 查看应用详情
     */
    @GetMapping("/get/vo")
    public BaseResponse<AppVO> getAppVOById(long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 查询应用
        App app = appService.getById(id);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR);

        // 校验权限（只能查看自己的应用或精选应用）
        if (!app.getUserId().equals(loginUser.getId()) && app.getPriority() != 1) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 浏览量增加
        App updateApp = new App();
        updateApp.setId(app.getId());
        updateApp.setPageViews(app.getPageViews() != null ? app.getPageViews() + 1 : 1L);
        appService.updateById(updateApp);


        AppVO appVO = appService.getAppVO(app);
        return ResultUtils.success(appVO);
    }

    /**
     * 【用户】分页查询自己的应用列表（支持根据名称查询，每页最多 20 个）
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<AppVO>> listMyAppVOByPage(@RequestBody AppQueryRequest appQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        Page<AppVO> appVOPage = appService.listAppVOByPageForUser(appQueryRequest, loginUser.getId());
        return ResultUtils.success(appVOPage);
    }

    /**
     * 【用户】分页查询精选的应用列表（支持根据名称查询，每页最多 20 个）
     */
    @PostMapping("/featured/list/page/vo")
    public BaseResponse<Page<AppVO>> listFeaturedAppVOByPage(@RequestBody AppQueryRequest appQueryRequest) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        Page<AppVO> appVOPage = appService.listFeaturedAppVOByPage(appQueryRequest);
        return ResultUtils.success(appVOPage);
    }

    /**
     * 【管理员】根据 id 删除任意应用（同时删除关联的对话历史）
     */
    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteAppByAdmin(@RequestBody DeleteRequest deleteRequest) {
        ThrowUtils.throwIf(deleteRequest == null || deleteRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        // 查询应用
        App app = appService.getById(deleteRequest.getId());
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR);

        // 先删除关联的对话历史
        boolean chatHistoryDeleted = chatHistoryService.deleteByAppId(deleteRequest.getId());
        if (!chatHistoryDeleted) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "删除对话历史失败");
        }

        // 再删除应用
        boolean result = appService.removeById(deleteRequest.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【管理员】根据 id 更新任意应用（支持更新应用名称、应用封面、优先级）
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateAppByAdmin(@RequestBody AppUpdateRequest appUpdateRequest) {
        ThrowUtils.throwIf(appUpdateRequest == null || appUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        App app = new App();
        BeanUtil.copyProperties(appUpdateRequest, app);
        app.setEditTime(new Date());

        boolean result = appService.updateById(app);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【管理员】分页查询应用列表（支持根据除时间外的任何字段查询，每页数量不限）
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<App>> listAppByPage(@RequestBody AppQueryRequest appQueryRequest) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = appQueryRequest.getPageNum();
        long pageSize = appQueryRequest.getPageSize();

        Page<App> appPage = appService.page(new Page<>(pageNum, pageSize), appService.getQueryWrapper(appQueryRequest));

        return ResultUtils.success(appPage);
    }

    /**
     * 【管理员】根据 id 查看应用详情
     */
    @GetMapping("/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<App> getAppById(long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);

        App app = appService.getById(id);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR);

        return ResultUtils.success(app);
    }

    /**
     * 【管理员】设置应用为精选/取消精选
     */
    @PostMapping("/set/featured")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> setAppFeatured(@RequestBody AppUpdateRequest appUpdateRequest) {
        ThrowUtils.throwIf(appUpdateRequest == null || appUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        // 查询应用是否存在
        App oldApp = appService.getById(appUpdateRequest.getId());
        ThrowUtils.throwIf(oldApp == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 设置优先级（1为精选，0为非精选）
        App app = new App();
        app.setId(appUpdateRequest.getId());
        app.setPriority(appUpdateRequest.getPriority() != null ? appUpdateRequest.getPriority() : 0);
        app.setEditTime(new Date());

        boolean result = appService.updateById(app);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【管理员】分页查询所有应用列表（按创建时间倒序排列）
     */
    @PostMapping("/list/all/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<App>> listAllAppsByPage(@RequestBody AppQueryRequest appQueryRequest) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = appQueryRequest.getPageNum();
        long pageSize = appQueryRequest.getPageSize();

        // 创建查询条件，按创建时间倒序排列
        QueryWrapper<App> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("createTime");

        Page<App> appPage = appService.page(new Page<>(pageNum, pageSize), queryWrapper);
        return ResultUtils.success(appPage);
    }

    /**
     * 与ai对话生成应用
     *
     * @param appId
     * @param message
     * @param request
     * @return
     */
    @GetMapping(value = "/chat/gen/code", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    //redisson令牌桶限流
    @RateLimit(limitType = RateLimitType.USER, rate = 5, rateInterval = 60, message = "AI 对话请求过于频繁，请稍后再试")
    public Flux<ServerSentEvent<String>> chatToGenCode(@RequestParam Long appId, @RequestParam String message, HttpServletRequest request) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID无效");
        ThrowUtils.throwIf(StrUtil.isBlank(message), ErrorCode.PARAMS_ERROR, "用户消息不能为空");
        User loginUser = userService.getLoginUser(request);

        // 校验权限：应用所有者、精选应用、或空间成员可以访问
        checkAppAccessPermission(appId, loginUser);

        // IP级别限流检查（每分钟10次）
        ipUtils.checkIpRateLimit(request);

        Flux<String> contentFlux = appService.chatToGenCode(appId, message, loginUser);
        return contentFlux
                .map(chunk -> {
                    Map<String, String> wrapper = Map.of("d", chunk);
                    String jsonData = JSONUtil.toJsonStr(wrapper);
                    return ServerSentEvent.<String>builder()
                            .data(jsonData)
                            .build();
                })
                .concatWith(Mono.just(
                        // 发送结束事件
                        ServerSentEvent.<String>builder()
                                .data("[DONE]")
                                .build()
                ));
    }

    /**
     * 取消正在进行的代码生成
     *
     * @param appId   应用 ID
     * @param request 请求对象
     * @return 取消结果
     */
    @PostMapping("/chat/cancel")
    public BaseResponse<Boolean> cancelCodeGeneration(@RequestParam Long appId,
                                                      HttpServletRequest request) {
        // 参数校验
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID无效");
        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 执行取消操作
        boolean success = appService.cancelGeneration(appId, loginUser.getId());

        return ResultUtils.success(success);
    }

    /**
     * 部署应用
     *
     * @param appDeployRequest
     * @param request
     * @return
     */
    @PostMapping("/deploy")
    public BaseResponse<String> deployApp(@RequestBody AppDeployRequest appDeployRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(appDeployRequest == null, ErrorCode.PARAMS_ERROR);
        Long appId = appDeployRequest.getAppId();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        User loginUser = userService.getLoginUser(request);
        String deployUrl = appService.deployApp(appId, loginUser);
        return ResultUtils.success(deployUrl);
    }

    /**
     * 查询所有应用类别
     *
     * @return 应用类别列表
     */
    @GetMapping("/types")
    public BaseResponse<List<AppTypeVO>> listAllAppTypes() {
        List<AppTypeVO> appTypeList = Arrays.stream(AppTypeEnum.values()).map(appType -> {
            AppTypeVO appTypeVO = new AppTypeVO();
            appTypeVO.setCode(appType.getCode());
            appTypeVO.setText(appType.getText());
            appTypeVO.setCategory(appType.getCategory());
            appTypeVO.setCategoryName(appType.getCategoryName());
            return appTypeVO;
        }).collect(Collectors.toList());
        return ResultUtils.success(appTypeList);
    }

    /**
     * 获取所有预设提示词列表
     */
    @GetMapping("/preset-prompts")
    public BaseResponse<List<PresetPromptVO>> listAllPresetPrompts() {
        List<PresetPromptVO> promptList = Arrays.stream(PresetPromptEnum.values()).map(prompt -> {
            PresetPromptVO vo = new PresetPromptVO();
            vo.setLabel(prompt.getLabel());
            vo.setPrompt(prompt.getPrompt());
            return vo;
        }).collect(Collectors.toList());
        return ResultUtils.success(promptList);
    }

    /**
     * 检查应用访问权限
     * 应用所有者、精选应用、或空间成员可以访问
     *
     * @param appId     应用ID
     * @param loginUser 当前登录用户
     */
    private void checkAppAccessPermission(Long appId, User loginUser) {
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 应用所有者可以访问
        if (app.getUserId().equals(loginUser.getId())) {
            return;
        }

        // 精选应用可以访问
        if (app.getPriority() != null && app.getPriority() == 1) {
            return;
        }

        // 空间成员可以访问
        if (app.getSpaceId() != null) {
            QueryWrapper queryWrapper = new QueryWrapper();
            queryWrapper.eq("spaceId", app.getSpaceId());
            queryWrapper.eq("userId", loginUser.getId());
            boolean isSpaceMember = spaceUserService.count(queryWrapper) > 0;
            if (isSpaceMember) {
                return;
            }
        }

        // 无权限访问
        throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限访问该应用");
    }

}