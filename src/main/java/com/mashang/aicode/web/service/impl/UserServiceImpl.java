package com.mashang.aicode.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.user.UserQueryRequest;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.UserRoleEnum;
import com.mashang.aicode.web.model.vo.LoginUserVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.mashang.aicode.web.constant.UserConstant.USER_LOGIN_STATE;

/**
 * 用户 服务层实现。
 *
 * @author <a href="https://github.com/liyupi">程序员鱼皮</a>
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public long userRegister(String userAccount, String userPassword, String checkPassword) {
        // 1. 校验参数
        if (StrUtil.hasBlank(userAccount, userPassword, checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号长度过短");
        }
        if (userPassword.length() < 8 || checkPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码长度过短");
        }
        if (!userPassword.equals(checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
        }
        // 2. 查询用户是否已存在
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("userAccount", userAccount);
        long count = this.mapper.selectCountByQuery(queryWrapper);
        if (count > 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号重复");
        }
        // 3. 加密密码
        String encryptPassword = getEncryptPassword(userPassword);
        // 4. 创建用户，插入数据库
        User user = new User();
        user.setUserAccount(userAccount);
        user.setUserPassword(encryptPassword);
        user.setUserName("无名");
        user.setUserRole(UserRoleEnum.USER.getValue());
        boolean saveResult = this.save(user);
        if (!saveResult) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "注册失败，数据库错误");
        }
        return user.getId();
    }

    @Override
    public LoginUserVO getLoginUserVO(User user) {
        if (user == null) {
            return null;
        }
        LoginUserVO loginUserVO = new LoginUserVO();
        BeanUtil.copyProperties(user, loginUserVO);
        return loginUserVO;
    }

    @Override
    public LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request) {
        // 1. 校验参数
        if (StrUtil.hasBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号长度过短");
        }
        if (userPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码长度过短");
        }
        // 2. 加密
        String encryptPassword = getEncryptPassword(userPassword);
        // 3. 查询用户是否存在
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("userAccount", userAccount);
        queryWrapper.eq("userPassword", encryptPassword);
        User user = this.mapper.selectOneByQuery(queryWrapper);
        if (user == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户不存在或密码错误");
        }
        // 4. 使用 Sa-Token 记录用户的登录态
        StpUtil.login(user.getId());
        // 5. 返回脱敏的用户信息
        return this.getLoginUserVO(user);
    }

    @Override
    public User getLoginUser(HttpServletRequest request) {
        // 使用 Sa-Token 判断用户是否登录
        if (!StpUtil.isLogin()) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        // 从 Sa-Token 获取用户ID
        long userId = StpUtil.getLoginIdAsLong();
        // 从数据库查询当前用户信息
        User currentUser = this.getById(userId);
        if (currentUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        return currentUser;
    }

    @Override
    public UserVO getUserVO(User user) {
        if (user == null) {
            return null;
        }
        UserVO userVO = new UserVO();
        BeanUtil.copyProperties(user, userVO);
        return userVO;
    }

    @Override
    public List<UserVO> getUserVOList(List<User> userList) {
        if (CollUtil.isEmpty(userList)) {
            return new ArrayList<>();
        }
        return userList.stream().map(this::getUserVO).collect(Collectors.toList());
    }

    @Override
    public boolean userLogout(HttpServletRequest request) {
        // 先判断用户是否登录
        Object userObj = request.getSession().getAttribute(USER_LOGIN_STATE);
        if (userObj == null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "用户未登录");
        }
        // 移除登录态
        request.getSession().removeAttribute(USER_LOGIN_STATE);
        return true;
    }

    @Override
    public QueryWrapper getQueryWrapper(UserQueryRequest userQueryRequest) {
        if (userQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        Long id = userQueryRequest.getId();
        String userAccount = userQueryRequest.getUserAccount();
        String userName = userQueryRequest.getUserName();
        String userProfile = userQueryRequest.getUserProfile();
        String userRole = userQueryRequest.getUserRole();
        String sortField = userQueryRequest.getSortField();
        String sortOrder = userQueryRequest.getSortOrder();
        return QueryWrapper.create().eq("id", id) // where id = ${id}
                .eq("userRole", userRole) // and userRole = ${userRole}
                .like("userAccount", userAccount).like("userName", userName).like("userProfile", userProfile).orderBy(sortField, "ascend".equals(sortOrder));
    }

    @Override
    public String getEncryptPassword(String userPassword) {
        // 盐值，混淆密码
        final String SALT = "yupi";
        return DigestUtils.md5DigestAsHex((userPassword + SALT).getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public boolean updatePassword(String oldPassword, String newPassword, String checkPassword, Long userId) {
        // 1. 校验参数
        if (StrUtil.hasBlank(oldPassword, newPassword, checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (newPassword.length() < 8 || checkPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码长度过短");
        }
        if (!newPassword.equals(checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
        }
        // 2. 查询用户是否存在
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        }
        // 3. 校验原密码是否正确
        String encryptOldPassword = getEncryptPassword(oldPassword);
        if (!user.getUserPassword().equals(encryptOldPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "原密码错误");
        }
        // 4. 加密新密码
        String encryptNewPassword = getEncryptPassword(newPassword);
        // 5. 更新密码
        user.setUserPassword(encryptNewPassword);
        boolean result = this.updateById(user);
        if (!result) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "修改密码失败");
        }
        return true;
    }

    @Override
    public boolean updateUserInfo(String userName, String userProfile, Long userId) {
        // 1. 查询用户是否存在
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        }
        // 2. 更新用户信息
        if (StrUtil.isNotBlank(userName)) {
            user.setUserName(userName);
        }
        if (StrUtil.isNotBlank(userProfile)) {
            user.setUserProfile(userProfile);
        }
        boolean result = this.updateById(user);
        if (!result) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "修改用户信息失败");
        }
        return true;
    }

    @Override
    public boolean updateUserAvatar(String userAvatar, Long userId) {
        // 1. 查询用户是否存在
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        }
        // 2. 更新用户头像
        user.setUserAvatar(userAvatar);
        boolean result = this.updateById(user);
        if (!result) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "修改用户头像失败");
        }
        return true;
    }
}
