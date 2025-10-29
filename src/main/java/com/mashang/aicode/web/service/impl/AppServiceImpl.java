package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.ai.core.AiCodeGeneratorFacade;
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
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.File;
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
public class AppServiceImpl extends ServiceImpl<AppMapper, App> implements AppService {

    @Resource
    private UserService userService;

    @Resource
    private UserMapper userMapper;
    @Autowired
    private AiCodeGeneratorFacade aiCodeGeneratorFacade;

    @Override
    public AppVO getAppVO(App app) {
        if (app == null) {
            return null;
        }
        AppVO appVO = new AppVO();
        BeanUtil.copyProperties(app, appVO);
        
        // 设置用户信息
        if (app.getUserid() != null) {
            User user = userMapper.selectOneById(app.getUserid());
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
        List<Long> userIds = appList.stream()
                .map(App::getUserid)
                .distinct()
                .collect(Collectors.toList());
        
        // 批量查询用户信息
        Map<Long, UserVO> userVOMap = userMapper.selectListByQuery(
                QueryWrapper.create().select(USER.ID, USER.USER_NAME, USER.USER_AVATAR)
                        .where(USER.ID.in(userIds))
        ).stream()
                .map(userService::getUserVO)
                .collect(Collectors.toMap(UserVO::getId, userVO -> userVO));
        
        // 转换为VO列表
        return appList.stream()
                .map(app -> {
                    AppVO appVO = new AppVO();
                    BeanUtil.copyProperties(app, appVO);
                    appVO.setUser(userVOMap.get(app.getUserid()));
                    return appVO;
                })
                .collect(Collectors.toList());
    }

    @Override
    public QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest) {
        if (appQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        
        Long id = appQueryRequest.getId();
        String appName = appQueryRequest.getAppName();
        String appDesc = appQueryRequest.getAppDesc();
        Long userId = appQueryRequest.getUserId();
        Integer isFeatured = appQueryRequest.getIsFeatured();
        String searchKey = appQueryRequest.getSearchKey();
        
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq(String.valueOf(AppTableDef.APP.ID), id)
                .eq(String.valueOf(AppTableDef.APP.USER_ID), userId)
                .eq(String.valueOf(AppTableDef.APP.IS_FEATURED), isFeatured)
                .like(appName, APP.APP_NAME, StrUtil.isNotBlank(appName))
                .like(appDesc, APP.APP_DESC, StrUtil.isNotBlank(appDesc));
        
        // 搜索关键词（名称和描述模糊搜索）
        if (StrUtil.isNotBlank(searchKey)) {
            QueryWrapper searchWrapper = QueryWrapper.create()
                    .like(String.valueOf(AppTableDef.APP.APP_NAME), searchKey)
                    .like(String.valueOf(AppTableDef.APP.APP_DESC), searchKey);
            queryWrapper.and(String.valueOf(searchWrapper));
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
        
        Page<App> appPage = this.page(Page.of(pageNum, pageSize),
                getQueryWrapper(appQueryRequest));
        
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
        
        Page<App> appPage = this.page(Page.of(pageNum, pageSize),
                getQueryWrapper(appQueryRequest));
        
        // 数据转换
        Page<AppVO> appVOPage = new Page<>(pageNum, pageSize, appPage.getTotalRow());
        List<AppVO> appVOList = getAppVOList(appPage.getRecords());
        appVOPage.setRecords(appVOList);
        
        return appVOPage;
    }

    /**
     * ai对话生成应用方法
     * @param appId 应用id
     * @param message 用户提示词
     * @param loginUser 登录用户
     * @return
     */
    @Override
    public Flux<String> chatToGenCode(Long appId, String message, User loginUser) {

        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        ThrowUtils.throwIf(StrUtil.isBlank(message), ErrorCode.PARAMS_ERROR, "用户消息不能为空");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        if (!app.getUserid().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限访问该应用");
        }

        String codeGenTypeStr = app.getCodegentype();
        CodeGenTypeEnum codeGenTypeEnum = CodeGenTypeEnum.getEnumByValue(codeGenTypeStr);
        if (codeGenTypeEnum == null) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "不支持的代码生成类型");
        }

        return aiCodeGeneratorFacade.generateAndSaveCodeStream(message, codeGenTypeEnum, appId);
    }

    /**
     * 部署应用方法
     * @param appId 应用id
     * @param loginUser 登录用户
     * @return
     */
    @Override
    public String deployApp(Long appId, User loginUser) {

        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用 ID 不能为空");
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR, "用户未登录");

        App app = this.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        if (!app.getUserid().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限部署该应用");
        }

        String deployKey = app.getDeploykey();

        if (StrUtil.isBlank(deployKey)) {
            deployKey = RandomUtil.randomString(6);
        }

        String codeGenType = app.getCodegentype();
        String sourceDirName = codeGenType + "_" + appId;
        String sourceDirPath = AppConstant.CODE_OUTPUT_ROOT_DIR + File.separator + sourceDirName;

        File sourceDir = new File(sourceDirPath);
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "应用代码不存在，请先生成代码");
        }

        String deployDirPath = AppConstant.CODE_DEPLOY_ROOT_DIR + File.separator + deployKey;
        try {
            FileUtil.copyContent(sourceDir, new File(deployDirPath), true);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "部署失败：" + e.getMessage());
        }

        App updateApp = new App();
        updateApp.setId(appId);
        updateApp.setDeploykey(deployKey);
        updateApp.setDeployedtime(new Date());
        boolean updateResult = this.updateById(updateApp);
        ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR, "更新应用部署信息失败");

        return String.format("%s/%s/", AppConstant.CODE_DEPLOY_HOST, deployKey);
    }




}