package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
import com.mashang.aicode.web.ai.core.StreamHandlerExecutor;
import com.mashang.aicode.web.ai.core.builder.ProjectBuilder;
import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import com.mashang.aicode.web.constant.AppConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;

import com.mashang.aicode.web.mapper.AppMapper;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.app.AppQueryRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.entity.table.AppTableDef;
import com.mashang.aicode.web.model.enums.ChatHistoryMessageTypeEnum;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.monitor.MonitorContext;
import com.mashang.aicode.web.monitor.MonitorContextHolder;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.service.ScreenshotService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.core.update.UpdateWrapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.update.UpdateChain;
import com.mybatisflex.spring.service.impl.ServiceImpl;
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

import static com.mashang.aicode.web.model.entity.table.AppTableDef.APP;
import static com.mashang.aicode.web.model.entity.table.UserTableDef.USER;

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

    @Override
    public AppVO getAppVO(App app) {
        if (app == null) {
            return null;
        }
        AppVO appVO = new AppVO();
        BeanUtil.copyProperties(app, appVO);

        // 设置用户信息
        if (app.getUserId() != null) {
            User user = userMapper.selectOneById(app.getUserId());
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
        Map<Long, UserVO> userVOMap = userMapper.selectListByQuery(QueryWrapper.create().select(USER.ID, USER.USER_NAME, USER.USER_AVATAR).where(USER.ID.in(userIds))).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        // 转换为VO列表
        return appList.stream().map(app -> {
            AppVO appVO = new AppVO();
            BeanUtil.copyProperties(app, appVO);
            appVO.setUser(userVOMap.get(app.getUserId()));
            return appVO;
        }).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest) {
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

        // 正确的写法
        QueryWrapper queryWrapper = QueryWrapper.create();

        // 使用正确的条件构建方式
        if (id != null) {
            queryWrapper.and(APP.ID.eq(id));
        }
        if (userId != null) {
            queryWrapper.and(APP.USER_ID.eq(userId));
        }
        if (StrUtil.isNotBlank(codeGenType)) {
            queryWrapper.and(APP.CODE_GEN_TYPE.eq(codeGenType));
        }
        if (isFeatured != null) {
            queryWrapper.and(APP.PRIORITY.eq(isFeatured));
        }
        if (StrUtil.isNotBlank(appType)) {
            queryWrapper.and(APP.APP_TYPE.eq(appType));
        }
        if (StrUtil.isNotBlank(appName)) {
            queryWrapper.and(APP.APP_NAME.like("%" + appName + "%"));
        }

        // 搜索关键词（应用名称模糊搜索）
        if (StrUtil.isNotBlank(searchKey)) {
            queryWrapper.and(APP.APP_NAME.like("%" + searchKey + "%"));
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

        QueryWrapper queryWrapper = getQueryWrapper(appQueryRequest);

        // 添加排序逻辑
        String sortField = appQueryRequest.getSortField();
        String sortOrder = appQueryRequest.getSortOrder();
        if (StrUtil.isNotBlank(sortField)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("pageViews".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(APP.PAGE_VIEWS, isAsc);
            } else if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(APP.CREATE_TIME, isAsc);
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderBy(APP.CREATE_TIME, false);
        }


        Page<App> appPage = this.page(Page.of(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<AppVO> appVOPage = new Page<>(pageNum, pageSize, appPage.getTotalRow());
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

        QueryWrapper queryWrapper = getQueryWrapper(appQueryRequest);

        // 添加排序逻辑
        String sortField = appQueryRequest.getSortField();
        String sortOrder = appQueryRequest.getSortOrder();
        if (StrUtil.isNotBlank(sortField)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            if ("pageViews".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(APP.PAGE_VIEWS, isAsc);
            } else if ("createTime".equalsIgnoreCase(sortField)) {
                queryWrapper.orderBy(APP.CREATE_TIME, isAsc);
            }
        } else {
            // 默认按创建时间降序
            queryWrapper.orderBy(APP.CREATE_TIME, false);
        }

        Page<App> appPage = this.page(Page.of(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<AppVO> appVOPage = new Page<>(pageNum, pageSize, appPage.getTotalRow());
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
    public Flux<String> chatToGenCode(Long appId, String message, User loginUser) {

        if (message == null || message.length() > 1000) {
            return Flux.error(new BusinessException(ErrorCode.PARAMS_ERROR, "输入内容过长，不要超过 1000 字"));
        }
        App app = this.getById(appId);
        String codeGenTypeStr = app.getCodeGenType();
        CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(codeGenTypeStr);
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的代码生成类型");
        }
        // 5. 通过校验后，添加用户消息到对话历史
        chatHistoryService.addChatMessage(appId, message, ChatHistoryMessageTypeEnum.USER.getValue(), loginUser.getId());

        //生成应用前设置上下文
        MonitorContextHolder.setContext(
                MonitorContext.builder()
                        .userId(loginUser.getId().toString())
                        .appId(appId.toString())
                        .build()
        );

        // 6. 调用 AI 生成代码（流式）
        Flux<String> codeStream = aiCodeGeneratorFacade.generateAndSaveCodeStream(message, codeGenTypeEnum, appId, null, loginUser.getId(), loginUser);

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

        QueryWrapper queryWrapper = QueryWrapper.create();
        queryWrapper.and(APP.SPACE_ID.eq(spaceId));
        queryWrapper.orderBy(APP.CREATE_TIME, false);

        Page<App> appPage = this.page(Page.of(current, pageSize), queryWrapper);

        Page<AppVO> appVOPage = new Page<>();
        appVOPage.setPageNumber(appPage.getPageNumber());
        appVOPage.setPageSize(appPage.getPageSize());
        appVOPage.setTotalRow(appPage.getTotalRow());
        appVOPage.setTotalPage(appPage.getTotalPage());

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

        boolean result = UpdateChain.of(App.class)
                .set(App::getSpaceId, spaceId)
                .where(App::getId).eq(appId)
                .update();
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

        boolean result = UpdateChain.of(App.class)
                .set(App::getSpaceId, null)
                .where(App::getId).eq(appId)
                .update();
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR, "从空间移除应用失败");

        return true;
    }

    /**
     * 取消正在进行的代码生成
     * 
     * 这个方法用于中断指定应用的代码生成任务。
     * 
     * 工作流程：
     * 1. 调用 AiCodeGeneratorFacade.interrupt(appId) 设置中断标志
     * 2. AI检测到中断标志后，停止生成代码
     * 3. 已生成的内容会自动保存到对话历史中
     * 
     * 参数说明：
     * @param appId 应用ID，用于指定要中断哪个应用的代码生成
     * @param userId 用户ID，用于权限验证
     * 
     * 返回值：
     * @return 是否成功取消
     * 
     * 使用场景：
     * - 用户点击"停止生成"按钮
     * - 用户切换到其他页面，需要停止当前生成
     * - 系统检测到异常，需要立即停止生成
     * 
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