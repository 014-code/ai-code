package com.mashang.aicode.web.manager;

import com.mashang.aicode.web.constant.SpaceUserPermissionConstant;
import com.mashang.aicode.web.model.entity.Space;
import com.mashang.aicode.web.model.entity.SpaceUser;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.SpaceUserRoleEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 空间用户权限管理器
 * 用于管理空间内用户的权限判断和权限列表获取
 */
@Component
@Slf4j
public class SpaceUserAuthManager {

    /**
     * 获取用户在空间中的权限列表
     *
     * @param space 空间对象
     * @param user  用户对象
     * @return 权限列表
     */
    public List<String> getPermissionList(Space space, User user) {
        if (space == null || user == null) {
            return new ArrayList<>();
        }
        // 空间所有者拥有所有权限
        if (user.getId().equals(space.getOwnerId())) {
            return SpaceUserPermissionConstant.OWNER_PERMISSIONS;
        }
        // 管理员拥有大部分权限
        SpaceUserRoleEnum roleEnum = SpaceUserRoleEnum.getEnumByValue("MEMBER");
        if (roleEnum == SpaceUserRoleEnum.ADMIN) {
            return SpaceUserPermissionConstant.ADMIN_PERMISSIONS;
        }
        // 普通成员拥有基础权限
        return SpaceUserPermissionConstant.MEMBER_PERMISSIONS;
    }

    /**
     * 判断用户是否拥有指定权限
     *
     * @param space     空间对象
     * @param user      用户对象
     * @param permission 权限标识
     * @return 是否拥有权限
     */
    public boolean hasPermission(Space space, User user, String permission) {
        List<String> permissionList = getPermissionList(space, user);
        return permissionList.contains(permission);
    }
}
