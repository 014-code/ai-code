package com.mashang.aicode.web.service;

import com.mashang.aicode.web.model.dto.app.AppQueryRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * 应用 服务层。
 */
@Service
public interface AppService extends IService<App> {

    /**
     * 获取应用封装类
     *
     * @param app 应用信息
     * @return 应用封装类
     */
    AppVO getAppVO(App app);

    /**
     * 获取应用封装类列表
     *
     * @param appList 应用列表
     * @return 应用封装类列表
     */
    List<AppVO> getAppVOList(List<App> appList);

    /**
     * 根据查询条件构造数据查询参数
     *
     * @param appQueryRequest 查询请求
     * @return 查询包装器
     */
    QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest);

    /**
     * 分页获取应用封装列表（用户）
     *
     * @param appQueryRequest 查询请求
     * @param userId 用户ID
     * @return 分页结果
     */
    Page<AppVO> listAppVOByPageForUser(AppQueryRequest appQueryRequest, Long userId);

    /**
     * 分页获取精选应用封装列表
     *
     * @param appQueryRequest 查询请求
     * @return 分页结果
     */
    Page<AppVO> listFeaturedAppVOByPage(AppQueryRequest appQueryRequest);

    /**
     * 聊天生成代码
     * @param appId 应用id
     * @param message 用户提示词
     * @param loginUser 登录用户
     * @return
     */
    public Flux<String> chatToGenCode(Long appId, String message, User loginUser);

    /**
     * 部署app
     * @param appId 应用id
     * @param loginUser 登录用户
     * @return
     */
    public String deployApp(Long appId, User loginUser);

    /**
     * 删除应用（同时删除关联的对话历史）
     * @param appId 应用id
     * @param loginUser 登录用户
     * @return 删除结果
     */
    public boolean deleteApp(Long appId, User loginUser);




}