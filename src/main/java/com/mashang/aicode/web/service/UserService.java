package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.dto.user.UserQueryRequest;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.LoginUserVO;
import com.mashang.aicode.web.model.vo.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 用户 服务层。
 *
 */
@Service
public interface UserService extends IService<User> {

    /**
     * 用户注册
     *
     * @param userAccount   用户账户
     * @param userPassword  用户密码
     * @param checkPassword 校验密码
     * @return 新用户 id
     */
    long userRegister(String userAccount, String userPassword, String checkPassword);

    /**
     * 获取脱敏的已登录用户信息
     *
     * @return
     */
    LoginUserVO getLoginUserVO(User user);

    /**
     * 用户登录
     *
     * @param userAccount  用户账户
     * @param userPassword 用户密码
     * @param request
     * @return 脱敏后的用户信息
     */
    LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request);

    /**
     * 获取当前登录用户
     *
     * @param request
     * @return
     */
    User getLoginUser(HttpServletRequest request);

    /**
     * 获取脱敏后的用户信息
     *
     * @param user 用户信息
     * @return
     */
    UserVO getUserVO(User user);

    /**
     * 获取脱敏后的用户信息（分页）
     *
     * @param userList 用户列表
     * @return
     */
    List<UserVO> getUserVOList(List<User> userList);

    /**
     * 用户注销
     *
     * @param request
     * @return 退出登录是否成功
     */
    boolean userLogout(HttpServletRequest request);

    /**
     * 根据查询条件构造数据查询参数
     *
     * @param userQueryRequest
     * @return
     */
    QueryWrapper getQueryWrapper(UserQueryRequest userQueryRequest);

    /**
     * 加密
     *
     * @param userPassword 用户密码
     * @return 加密后的用户密码
     */
    String getEncryptPassword(String userPassword);

    /**
     * 修改密码
     *
     * @param oldPassword  原密码
     * @param newPassword  新密码
     * @param checkPassword 确认新密码
     * @param userId       用户ID
     * @return 修改是否成功
     */
    boolean updatePassword(String oldPassword, String newPassword, String checkPassword, Long userId);

    /**
     * 修改用户信息
     *
     * @param userName    用户昵称
     * @param userProfile 用户简介
     * @param userId      用户ID
     * @return 修改是否成功
     */
    boolean updateUserInfo(String userName, String userProfile, Long userId);

    /**
     * 修改用户头像
     *
     * @param userAvatar 用户头像URL
     * @param userId     用户ID
     * @return 修改是否成功
     */
    boolean updateUserAvatar(String userAvatar, Long userId);
}
