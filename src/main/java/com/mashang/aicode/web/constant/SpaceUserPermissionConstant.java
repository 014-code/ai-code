package com.mashang.aicode.web.constant;

import com.mashang.aicode.web.model.enums.SpacePermissionEnum;
import com.mashang.aicode.web.model.enums.SpaceUserRoleEnum;

import java.util.Arrays;
import java.util.List;

/**
 * 空间用户权限常量
 */
public class SpaceUserPermissionConstant {

    public static final String APP_MANAGE = SpacePermissionEnum.APP_MANAGE.getValue();
    public static final String MEMBER_MANAGE = SpacePermissionEnum.MEMBER_MANAGE.getValue();
    public static final String SPACE_MANAGE = SpacePermissionEnum.SPACE_MANAGE.getValue();
    public static final String VIEW_APP = SpacePermissionEnum.VIEW_APP.getValue();
    public static final String EDIT_APP = SpacePermissionEnum.EDIT_APP.getValue();
    public static final String DELETE_APP = SpacePermissionEnum.DELETE_APP.getValue();

    public static final String OWNER = SpaceUserRoleEnum.OWNER.getValue();
    public static final String ADMIN = SpaceUserRoleEnum.ADMIN.getValue();
    public static final String MEMBER = SpaceUserRoleEnum.MEMBER.getValue();

    public static final List<String> OWNER_PERMISSIONS = Arrays.asList(
            APP_MANAGE,
            MEMBER_MANAGE,
            SPACE_MANAGE,
            VIEW_APP,
            EDIT_APP,
            DELETE_APP
    );

    public static final List<String> ADMIN_PERMISSIONS = Arrays.asList(
            APP_MANAGE,
            VIEW_APP,
            EDIT_APP,
            DELETE_APP
    );

    public static final List<String> MEMBER_PERMISSIONS = Arrays.asList(
            VIEW_APP,
            EDIT_APP
    );
}
