package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
import com.mashang.aicode.web.ai.core.StreamHandlerExecutor;
import com.mashang.aicode.web.ai.core.builder.ProjectBuilder;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;

import com.mashang.aicode.web.mapper.AppMapper;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.app.AppQueryRequest;
import com.mashang.aicode.web.model.entity.AiModelConfig;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.ChatHistoryMessageTypeEnum;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.monitor.MonitorContext;
import com.mashang.aicode.web.monitor.MonitorContextHolder;
import com.mashang.aicode.web.service.*;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.File;
import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 应用 服务层实现。
 */
@Service
@Slf4j
public class AppServiceImpl extends ServiceImpl<AppMapper, App> implements AppService {

    @Resource
    private UserService userService;

    @Resource
    private UserMapper userMapper;

    @Resource
    private ChatHistoryService chatHistoryService;

    @Autowired
    private AiCodeGeneratorFacade aiCodeGeneratorFacade;
    @Autowired
    private StreamHandlerExecutor streamHandlerExecutor;

    @Resource
    private ProjectBuilder projectBuilder;

    @Resource
    private ScreenshotService screenshotService;
    @Autowired
    private AiModelConfigService aiModelConfigService;
    @Autowired
    private GenerationValidationService generationValidationService;
    @Autowired
    private UserPointService userPointService;

    @Override
    public AppVO getAppVO(App app) {
        if (app == null) {
            return null;
        }
        AppVO appVO = new AppVO();
        BeanUtil.copyProperties(app, appVO);

        // 设置用户信息
        if (app.getUserId() != null) {
            User user = userMapper.selectById(app.getUserId());
            if (user != null) {
                UserVO userVO = userService.getUserVO(user);
                appVO.setUser(userVO);
            }
        }

        return appVO;
    }

    @Override
    public List<AppVO> getAppVOList(List<App> appList) {
        if (CollUtil.isEmpty(appList)) {
            return new ArrayList<>();
        }

        // 获取所有用户ID
        List<Long> userIds = appList.stream().map(App::getUserId).distinct().collect(Collectors.toList());

        // 批量查询用户信息
        Map<Long, UserVO> userVOMap = userMapper.selectList(new LambdaQueryWrapper<User>().select(User::getId, User::getUserName, User::getUserAvatar).in(User::getId, userIds)).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        // 转换为VO列表
        return appList.stream().map(app -> {
            AppVO appVO = new AppVO();
            BeanUtil.copyProperties(app, appVO);
            appVO.setUser(userVOMap.get(app.getUserId()));
            return appVO;
        }).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper<App> getQueryWrapper(AppQueryRequest appQueryRequest) {
        if (appQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }

        Long id = appQueryRequest.getId();
        String appName = appQueryRequest.getAppName();
        String appDesc = appQueryRequest.getAppDesc();
        String codeGenType = appQueryRequest.getCodeGenType();
        Long userId = appQueryRequest.getUserId();
        Integer isFeatured = appQueryRequest.getIsFeatured();
        String searchKey = appQueryRequest.getSearchKey();
        String appType = appQueryRequest.getAppType();

        // 使用 MyBatis-Plus 的 QueryWrapper
        QueryWrapper<App> queryWrapper = new QueryWrapper<>();

        // 使用正确的条件构建方式
        if (id != null) {
            queryWrapper.eq("id", id);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (StrUtil.isNotBlank(codeGenType)) {
            queryWrapper.eq("codeGenType", codeGenType);
        }
        if (isFeatured != null) {
            queryWrapper.eq("priority", isFeatured);
        }
        if (StrUtil.isNotBlank(appType)) {
            queryWrapper.eq("appType", appType);
        }
        if (StrUtil.isNotBlank(appName)) {
            queryWrapper.like("appName", appName);
        }

        // 搜索关键词（应用名称模糊搜索）
        if (StrUtil.isNotBlank(searchKey)) {
            queryWrapper.like("appName", searchKey);
        }

        return queryWrapper;
    }

    @Override
    public Page<AppVO> listAppVOByPageForUser(AppQueryRequest appQueryRequest, Long userId) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        // 设置用户ID
        appQueryRequest.setUserId(userId);

        long pageNum = appQueryRequest.getPageNum();
        long pageSize = appQueryRequest.getPageSize();

        // 限制每页最多20个
        if (pageSize > 20) {
            pageSize = 20;
        }

        QueryWrapper<App> queryWrapper = getQueryWrapper(appQueryRequest);

        // 添加排序逻辑
        String sortField = appQueryRequest.getSortField();
        String sortOrder = appQueryRequest.getSortOrder();
        if (StrUtil.isNotBlank(sortField)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("pageViews".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "pageViews");
            } else if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "createTime");
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderByDesc("createTime");
        }


        Page<App> appPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<AppVO> appVOPage = new Page<>(pageNum, pageSize, appPage.getTotal());
        List<AppVO> appVOList = getAppVOList(appPage.getRecords());
        appVOPage.setRecords(appVOList);

        return appVOPage;
    }

    @Override
    public Page<AppVO> listFeaturedAppVOByPage(AppQueryRequest appQueryRequest) {
        ThrowUtils.throwIf(appQueryRequest == null, ErrorCode.PARAMS_ERROR);

        // 设置精选标志
        appQueryRequest.setIsFeatured(1);

        long pageNum = appQueryRequest.getPageNum();
        long pageSize = appQueryRequest.getPageSize();

        // 限制每页最多20个
        if (pageSize > 20) {
            pageSize = 20;
        }

        QueryWrapper<App> queryWrapper = getQueryWrapper(appQueryRequest);

        // 添加排序逻辑
        String sortField = appQueryRequest.getSortField();
        String sortOrder = appQueryRequest.getSortOrder();
        if (StrUtil.isNotBlank(sortField)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("pageViews".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "pageViews");
            } else if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(true, isAsc, "createTime");
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderByDesc("createTime");
        }

        Page<App> appPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<AppVO> appVOPage = new Page<>(pageNum, pageSize, appPage.getTotal());
        List<AppVO> appVOList = getAppVOList(appPage.getRecords());
        appVOPage.setRecords(appVOList);

        return appVOPage;
    }

    /**
     * ai对话生成应用方法
     *
     * @param appId     应用id
     * @param message   用户提示词
     * @param loginUser 登录用户
     * @return
     */
    @Override
    public Flux<String> chatToGenCode(Long appId, String message, User loginUser, String modelKey) {

        if (message == null || message.length() > 1000) {
            return Flux.error(new BusinessException(ErrorCode.PARAMS_ERROR, "输入内容过长，不要超过 1000 字"));
        }
        App app = this.getById(appId);
        String codeGenTypeStr = app.getCodeGenType();
        CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(codeGenTypeStr);
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的代码生成类型");
        }

        // 验证模型配置
        AiModelConfig modelConfig = aiModelConfigService.getByModelKey(modelKey);
        ThrowUtils.throwIf(modelConfig == null, ErrorCode.PARAMS_ERROR, "不支持的模型: " + modelKey);
        ThrowUtils.throwIf(modelConfig.getIsEnabled() == null || modelConfig.getIsEnabled() != 1,
                ErrorCode.PARAMS_ERROR, "模型已禁用: " + modelKey);
        log.info("用户 {} 选择模型: {} ({}), 等级: {}, 费用: {}/1K tokens",
                loginUser.getId(), modelConfig.getModelName(), modelKey,
                modelConfig.getTier(), modelConfig.getPointsPerKToken());

        // 4.0 防刷检测
        // 检查用户身份（管理员豁免所有限制）
        boolean isAdmin = UserConstant.ADMIN_ROLE.equals(loginUser.getUserRole());

        // 检查用户今日是否被禁止生成（管理员免检）
        if (!isAdmin && generationValidationService.isUserBannedToday(loginUser.getId())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "您今日已达到最大警告次数，暂时无法生成应用");
        }

        // 检查用户今日生成次数是否超限（管理员免检）
        if (!isAdmin && generationValidationService.isGenerationCountExceeded(loginUser.getId())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR,
                    String.format("您今日生成次数已达上限（%d次），请明天再试",
                            PointsConstants.DAILY_GENERATION_LIMIT));
        }

        // 检查用户今日Token消耗是否超限（管理员免检）
        if (!isAdmin && generationValidationService.isTokenLimitExceeded(loginUser.getId())) {
            int usage = generationValidationService.getTodayTokenUsage(loginUser.getId());
            throw new BusinessException(ErrorCode.OPERATION_ERROR,
                    String.format("您今日Token消耗已达上限（%d/%d），请明天再试",
                            usage, PointsConstants.DAILY_TOKEN_LIMIT));
        }

        // 检查24小时内是否重复生成相同需求（管理员免检）
        if (!isAdmin && generationValidationService.isDuplicateGeneration(loginUser.getId(), message)) {
            int warningCount = generationValidationService.recordWarningAndPunish(loginUser.getId(), "24小时内重复生成相同需求");
            String msg = String.format("检测到重复生成，已记录警告（今日第%d次），并扣除%d积分",
                    warningCount, PointsConstants.INVALID_GENERATION_PENALTY);
            throw new BusinessException(ErrorCode.OPERATION_ERROR, msg);
        }

        // 增加今日生成次数（管理员免计数）
        if (!isAdmin) {
            generationValidationService.incrementGenerationCount(loginUser.getId());
        }

        // 4.1 检查用户积分最低门槛（不再预扣，由监听器实时扣费）
        int minPoints = 50; // 最低积分门槛，确保基本使用能力
        if (!userPointService.checkPointsSufficient(loginUser.getId(), minPoints)) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR,
                    String.format("积分不足，至少需要 %d 积分才能生成，请先签到或邀请好友获取积分", minPoints));
        }
        log.info("用户 {} 开始生成应用 {}，当前积分充足（>= {}）", loginUser.getId(), appId, minPoints);

        // 5. 通过校验后，添加用户消息到对话历史
        chatHistoryService.addChatMessage(appId, message, ChatHistoryMessageTypeEnum.USER.getValue(), loginUser.getId());

        // 记录本次生成（用于后续重复检测，管理员免记录）
        if (!isAdmin) {
            generationValidationService.recordGeneration(loginUser.getId(), message);
        }

        //生成应用前设置上下文
        MonitorContextHolder.setContext(
                MonitorContext.builder()
                        .userId(loginUser.getId().toString())
                        .appId(appId.toString())
                        .modelKey(modelKey)
                        .build()
        );

        // 6. 调用 AI 生成代码（流式）
        Flux<String> codeStream = aiCodeGeneratorFacade.generateAndSaveCodeStream(message, codeGenTypeEnum, appId, null, loginUser.getId(), loginUser, modelKey);

        //流式响应完成后再清除上下文
        //7. 收集 AI 响应内容并在完成后记录到对话历史
        return streamHandlerExecutor.doExecute(codeStream, chatHistoryService, appId, loginUser, codeGenTypeEnum)
                .doFinally(signalType -> {
                    MonitorContextHolder.clearContext();
                });
    }

    /**
     * 部署应用方法
     *
     * @param appId     应用id
     * @param loginUser 登录用户
     * @return
     */
    @Override
    public String deployApp(Long appId, User loginUser) {

        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR, "用户未登录");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        if (!app.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限部署该应用");
        }

        String deployKey = app.getDeployKey();

        if (StrUtil.isBlank(deployKey)) {
            deployKey = RandomUtil.randomString(6);
        }


        String codeGenType = app.getCodeGenType();
        String sourceDirName = codeGenType + "_" + appId;
        String sourceDirPath = AppConstant.CODE_OUTPUT_ROOT_DIR + File.separator + sourceDirName;

        // 6. 检查源目录是否存在
        File sourceDir = new File(sourceDirPath);
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "应用代码不存在，请先生成代码");
        }
        // 7. Vue/React 项目特殊处理：执行构建
        CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(codeGenType);
        if (codeGenTypeEnum == CodeGenTypeEnum.VUE_PROJECT || codeGenTypeEnum == CodeGenTypeEnum.REACT_PROJECT) {
            // Vue/React 项目需要构建
            boolean buildSuccess = projectBuilder.buildProject(sourceDirPath);
            ThrowUtils.throwIf(!buildSuccess, ErrorCode.SYSTEM_ERROR, "Vue/React 项目构建失败，请检查代码和依赖");
            // 检查 dist 目录是否存在
            File distDir = new File(sourceDirPath, "dist");
            ThrowUtils.throwIf(!distDir.exists(), ErrorCode.SYSTEM_ERROR, "Vue/React 项目构建完成但未生成 dist 目录");
            // 将 dist 目录作为部署源
            sourceDir = distDir;
            log.info("Vue/React 项目构建成功，将部署 dist 目录: {}", distDir.getAbsolutePath());
        }
        String deployDirPath = AppConstant.CODE_DEPLOY_ROOT_DIR + File.separator + deployKey;
        //执行复制文件
        try {
            FileUtil.copyContent(sourceDir, new File(deployDirPath), true);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "部署失败：" + e.getMessage());
        }
        App updateApp = new App();
        updateApp.setId(appId);
        updateApp.setDeployKey(deployKey);
        updateApp.setDeployedTime(new Date());
        boolean updateResult = this.updateById(updateApp);
        ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR, "更新应用部署信息失败");
        String appDeployUrl = String.format("%s/%s/", AppConstant.CODE_DEPLOY_HOST, deployKey);
        generateAppScreenshotAsync(appId, appDeployUrl);
        return appDeployUrl;
    }

    /**
     * 删除应用（同时删除关联的对话历史）
     *
     * @param appId     应用id
     * @param loginUser 登录用户
     * @return 删除结果
     */
    @Override
    public boolean deleteApp(Long appId, User loginUser) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR, "用户未登录");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 校验权限（只能删除自己的应用）
        if (!app.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限删除该应用");
        }

        // 先删除关联的对话历史
        boolean chatHistoryDeleted = chatHistoryService.deleteByAppId(appId);

        // 再删除应用
        boolean appDeleted = this.removeById(appId);
        ThrowUtils.throwIf(!appDeleted, ErrorCode.OPERATION_ERROR, "删除应用失败");

        return true;
    }

    /**
     * 重写flex内部的removeById-加了同步删除对话消息的逻辑
     *
     * @param id
     * @return
     */
    @Override
    public boolean removeById(Serializable id) {
        if (id == null) {
            return false;
        }

        Long appId = Long.valueOf(id.toString());
        if (appId <= 0) {
            return false;
        }

        try {
            chatHistoryService.deleteByAppId(appId);
        } catch (Exception e) {
            log.error("删除应用关联对话历史失败: {}", e.getMessage());
        }
        return super.removeById(id);
    }

    @Override
    public void generateAppScreenshotAsync(Long appId, String appUrl) {
        //开一个虚拟线程，执行异步截图操作
        Thread.startVirtualThread(() -> {
            String screenshotUrl = screenshotService.generateAndUploadScreenshot(appUrl);
            App updateApp = new App();
            updateApp.setId(appId);
            updateApp.setCover(screenshotUrl);
            boolean updated = this.updateById(updateApp);
            ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR, "更新应用封面字段失败");
        });
    }

    @Override
    public Page<AppVO> listAppVOByPageForSpace(Long spaceId, Integer current, Integer pageSize) {
        ThrowUtils.throwIf(spaceId == null || spaceId <= 0, ErrorCode.PARAMS_ERROR);

        if (current == null || current <= 0) {
            current = 1;
        }
        if (pageSize == null || pageSize <= 0) {
            pageSize = 20;
        }

        QueryWrapper<App> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("spaceId", spaceId);
        queryWrapper.orderByDesc("createTime");

        Page<App> appPage = this.page(new Page<>(current, pageSize), queryWrapper);

        Page<AppVO> appVOPage = new Page<>();
        appVOPage.setCurrent(appPage.getCurrent());
        appVOPage.setSize(appPage.getSize());
        appVOPage.setTotal(appPage.getTotal());
        appVOPage.setPages(appPage.getPages());

        List<AppVO> appVOList = appPage.getRecords().stream()
                .map(this::getAppVO)
                .collect(Collectors.toList());

        appVOPage.setRecords(appVOList);

        return appVOPage;
    }

    @Override
    public boolean addAppToSpace(Long appId, Long spaceId, Long userId) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(spaceId == null || spaceId <= 0, ErrorCode.PARAMS_ERROR, "空间ID不能为空");
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        if (!app.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "只能将自己的应用添加到空间");
        }

        if (app.getSpaceId() != null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "应用已属于某个空间");
        }

        boolean result = this.update(new LambdaUpdateWrapper<App>()
                .set(App::getSpaceId, spaceId)
                .eq(App::getId, appId));
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "添加应用到空间失败");

        return true;
    }

    @Override
    public boolean removeAppFromSpace(Long appId, Long spaceId, Long userId) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(spaceId == null || spaceId <= 0, ErrorCode.PARAMS_ERROR, "空间ID不能为空");
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        if (!app.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "只能移除自己的应用");
        }

        if (!spaceId.equals(app.getSpaceId())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "应用不属于该空间");
        }

        boolean result = this.update(new LambdaUpdateWrapper<App>()
                .set(App::getSpaceId, null)
                .eq(App::getId, appId));
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "从空间移除应用失败");

        return true;
    }

    /**
     * 取消正在进行的代码生成
     * <p>
     * 这个方法用于中断指定应用的代码生成任务。
     * <p>
     * 工作流程：
     * 1. 调用 AiCodeGeneratorFacade.interrupt(appId) 设置中断标志
     * 2. AI检测到中断标志后，停止生成代码
     * 3. 已生成的内容会自动保存到对话历史中
     * <p>
     * 参数说明：
     *
     * @param appId  应用ID，用于指定要中断哪个应用的代码生成
     * @param userId 用户ID，用于权限验证
     *               <p>
     *               返回值：
     * @return 是否成功取消
     * <p>
     * 使用场景：
     * - 用户点击"停止生成"按钮
     * - 用户切换到其他页面，需要停止当前生成
     * - 系统检测到异常，需要立即停止生成
     * <p>
     * 注意：
     * - 中断后，已生成的内容会自动保存到对话历史中
     * - 如果应用没有正在进行的生成任务，这个方法也会返回true
     */
    public boolean cancelGeneration(Long appId, Long userId) {
        try {
            log.info("开始取消代码生成，appId: {}, userId: {}", appId, userId);

            // 调用 AiCodeGeneratorFacade 的中断方法
            boolean success = aiCodeGeneratorFacade.interrupt(appId, userId);

            if (success) {
                log.info("成功取消代码生成，appId: {}, userId: {}", appId, userId);
            } else {
                log.warn("取消代码生成失败，appId: {}, userId: {}", appId, userId);
            }

            return success;
        } catch (Exception e) {
            log.error("取消代码生成失败，appId: {}, userId: {}, 错误: {}", appId, userId, e.getMessage(), e);
            return false;
        }
    }

}