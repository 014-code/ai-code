package com.mashang.aicode.web.controller;

import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.DeleteRequest;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.app.AppQueryRequest;
import com.mashang.aicode.web.model.dto.space.SpaceAddRequest;
import com.mashang.aicode.web.model.dto.space.SpaceAppRequest;
import com.mashang.aicode.web.model.dto.space.SpaceQueryRequest;
import com.mashang.aicode.web.model.dto.space.SpaceUpdateRequest;
import com.mashang.aicode.web.model.dto.space.SpaceUserAddRequest;
import com.mashang.aicode.web.model.dto.space.SpaceUserBatchAddRequest;
import com.mashang.aicode.web.model.dto.space.SpaceUserRemoveRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.Space;
import com.mashang.aicode.web.model.entity.SpaceUser;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.SpaceTypeEnum;
import com.mashang.aicode.web.model.enums.SpaceUserRoleEnum;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.SpaceUserVO;
import com.mashang.aicode.web.model.vo.SpaceVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.SpaceService;
import com.mashang.aicode.web.service.SpaceUserService;
import com.mashang.aicode.web.service.UserService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

/**
 * 空间管理控制器
 * 提供空间创建、修改、删除、成员管理、应用管理等接口
 */
@RestController
@RequestMapping("/space")
@Slf4j
public class SpaceController {

    @Resource
    private SpaceService spaceService;

    @Resource
    private SpaceUserService spaceUserService;

    @Resource
    private UserService userService;

    @Resource
    private AppService appService;

    @PostMapping("/add")
    public BaseResponse<Long> addSpace(@RequestBody SpaceAddRequest spaceAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceAddRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = new Space();
        space.setSpaceName(spaceAddRequest.getSpaceName());
        space.setSpaceType(spaceAddRequest.getSpaceType());
        space.setOwnerId(loginUser.getId());
        space.setDescription(spaceAddRequest.getDescription());
        space.setMemberCount(1);
        space.setAppCount(0);
        space.setIsDelete(0);

        boolean result = spaceService.save(space);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        // 自动将创建者添加为空间所有者
        SpaceUser spaceUser = new SpaceUser();
        spaceUser.setSpaceId(space.getId());
        spaceUser.setUserId(loginUser.getId());
        spaceUser.setRole(SpaceUserRoleEnum.OWNER.getValue());

        boolean userResult = spaceUserService.save(spaceUser);
        ThrowUtils.throwIf(!userResult, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(space.getId());
    }

    @PostMapping("/update")
    public BaseResponse<Boolean> updateSpace(@RequestBody SpaceUpdateRequest spaceUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceUpdateRequest == null || spaceUpdateRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = spaceService.getById(spaceUpdateRequest.getId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        // 只有空间所有者可以修改
        ThrowUtils.throwIf(!space.getOwnerId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        Space updateSpace = new Space();
        updateSpace.setId(spaceUpdateRequest.getId());
        if (StrUtil.isNotBlank(spaceUpdateRequest.getSpaceName())) {
            updateSpace.setSpaceName(spaceUpdateRequest.getSpaceName());
        }
        if (StrUtil.isNotBlank(spaceUpdateRequest.getDescription())) {
            updateSpace.setDescription(spaceUpdateRequest.getDescription());
        }

        boolean result = spaceService.updateById(updateSpace);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteSpace(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(deleteRequest == null || deleteRequest.getId() == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = spaceService.getById(deleteRequest.getId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        // 只有空间所有者可以删除
        ThrowUtils.throwIf(!space.getOwnerId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        boolean result = spaceService.removeById(deleteRequest.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    @GetMapping("/get")
    public BaseResponse<SpaceVO> getSpaceVOById(Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        Space space = spaceService.getById(id);
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        SpaceVO spaceVO = new SpaceVO();
        spaceVO.setId(space.getId());
        spaceVO.setSpaceName(space.getSpaceName());
        spaceVO.setSpaceType(space.getSpaceType());
        SpaceTypeEnum spaceTypeEnum = SpaceTypeEnum.getEnumByValue(space.getSpaceType());
        spaceVO.setSpaceTypeText(spaceTypeEnum != null ? spaceTypeEnum.getText() : "");
        spaceVO.setOwnerId(space.getOwnerId());
        spaceVO.setDescription(space.getDescription());
        spaceVO.setMemberCount(space.getMemberCount());
        spaceVO.setAppCount(space.getAppCount());
        spaceVO.setCreateTime(space.getCreateTime());
        spaceVO.setUpdateTime(space.getUpdateTime());

        User owner = userService.getById(space.getOwnerId());
        if (owner != null) {
            spaceVO.setOwnerName(owner.getUserName());
        }

        return ResultUtils.success(spaceVO);
    }

    @PostMapping("/list/page")
    public BaseResponse<Page<SpaceVO>> listSpaceVOByPage(@RequestBody SpaceQueryRequest spaceQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceQueryRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        List<Long> joinedSpaceIds = spaceUserService.list(
                new QueryWrapper<SpaceUser>().eq("userId", loginUser.getId())
        ).stream().map(SpaceUser::getSpaceId).toList();

        QueryWrapper<Space> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> {
            wrapper.eq("ownerId", loginUser.getId());
            if (!joinedSpaceIds.isEmpty()) {
                wrapper.or(w -> w.in("id", joinedSpaceIds));
            }
        });
        if (StrUtil.isNotBlank(spaceQueryRequest.getSpaceName())) {
            queryWrapper.like("spaceName", spaceQueryRequest.getSpaceName());
        }
        if (spaceQueryRequest.getSpaceType() != null) {
            queryWrapper.eq("spaceType", spaceQueryRequest.getSpaceType());
        }
        queryWrapper.orderByDesc("createTime");

        Integer current = spaceQueryRequest.getCurrent();
        Integer pageSize = spaceQueryRequest.getPageSize();
        if (current == null || current <= 0) {
            current = 1;
        }
        if (pageSize == null || pageSize <= 0) {
            pageSize = 20;
        }

        Page<Space> spacePage = spaceService.page(
                new Page<>(current, pageSize),
                queryWrapper
        );

        Page<SpaceVO> spaceVOPage = new Page<>();
        spaceVOPage.setCurrent(spacePage.getCurrent());
        spaceVOPage.setSize(spacePage.getSize());
        spaceVOPage.setTotal(spacePage.getTotal());
        spaceVOPage.setPages(spacePage.getPages());

        List<SpaceVO> spaceVOList = spacePage.getRecords().stream().map(space -> {
            SpaceVO spaceVO = new SpaceVO();
            spaceVO.setId(space.getId());
            spaceVO.setSpaceName(space.getSpaceName());
            spaceVO.setSpaceType(space.getSpaceType());
            SpaceTypeEnum spaceTypeEnum = SpaceTypeEnum.getEnumByValue(space.getSpaceType());
            spaceVO.setSpaceTypeText(spaceTypeEnum != null ? spaceTypeEnum.getText() : "");
            spaceVO.setOwnerId(space.getOwnerId());
            spaceVO.setDescription(space.getDescription());
            spaceVO.setMemberCount(space.getMemberCount());
            spaceVO.setAppCount(space.getAppCount());
            spaceVO.setCreateTime(space.getCreateTime());
            spaceVO.setUpdateTime(space.getUpdateTime());
            spaceVO.setOwnerId(space.getOwnerId());
            spaceVO.setIsOwner(space.getOwnerId().equals(loginUser.getId()));
            User owner = userService.getById(space.getOwnerId());
            spaceVO.setOwnerName(owner != null ? owner.getUserName() : "");
            spaceVO.setOwnerAvatar(owner != null ? owner.getUserAvatar() : "");
            return spaceVO;
        }).toList();

        spaceVOPage.setRecords(spaceVOList);

        return ResultUtils.success(spaceVOPage);
    }

    @PostMapping("/add/member")
    public BaseResponse<Boolean> addMember(@RequestBody SpaceUserAddRequest spaceUserAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceUserAddRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = spaceService.getById(spaceUserAddRequest.getSpaceId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        // 只有空间所有者可以添加成员
        ThrowUtils.throwIf(!space.getOwnerId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        // 只有团队空间才能添加成员
        ThrowUtils.throwIf(space.getSpaceType() != SpaceTypeEnum.TEAM.getValue(), ErrorCode.OPERATION_ERROR, "只有团队空间才能添加成员");

        User targetUser = userService.getById(spaceUserAddRequest.getUserId());
        ThrowUtils.throwIf(targetUser == null, ErrorCode.NOT_FOUND_ERROR, "用户不存在");

        // 检查用户是否已在空间中
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("spaceId", spaceUserAddRequest.getSpaceId());
        queryWrapper.eq("userId", spaceUserAddRequest.getUserId());
        SpaceUser existingMember = spaceUserService.getOne(queryWrapper);
        ThrowUtils.throwIf(existingMember != null, ErrorCode.OPERATION_ERROR, "用户已在空间中");

        SpaceUser spaceUser = new SpaceUser();
        spaceUser.setSpaceId(spaceUserAddRequest.getSpaceId());
        spaceUser.setUserId(spaceUserAddRequest.getUserId());
        spaceUser.setRole(spaceUserAddRequest.getRole());

        boolean result = spaceUserService.save(spaceUser);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        // 更新空间成员数量
        Space updateSpace = new Space();
        updateSpace.setId(spaceUserAddRequest.getSpaceId());
        updateSpace.setMemberCount(space.getMemberCount() + 1);
        spaceService.updateById(updateSpace);

        return ResultUtils.success(true);
    }

    @PostMapping("/add/members/batch")
    public BaseResponse<Boolean> batchAddMembers(@RequestBody SpaceUserBatchAddRequest batchAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(batchAddRequest == null || batchAddRequest.getUserIds() == null || batchAddRequest.getUserIds().isEmpty(), ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = spaceService.getById(batchAddRequest.getSpaceId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        // 只有空间所有者可以添加成员
        ThrowUtils.throwIf(!space.getOwnerId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        // 只有团队空间才能添加成员
        ThrowUtils.throwIf(space.getSpaceType() != SpaceTypeEnum.TEAM.getValue(), ErrorCode.OPERATION_ERROR, "只有团队空间才能添加成员");

        int addedCount = 0;
        for (Long userId : batchAddRequest.getUserIds()) {
            // 检查用户是否存在
            User targetUser = userService.getById(userId);
            if (targetUser == null) {
                continue; // 跳过不存在的用户
            }

            // 检查用户是否已在空间中
            QueryWrapper queryWrapper = new QueryWrapper();
            queryWrapper.eq("spaceId", batchAddRequest.getSpaceId());
            queryWrapper.eq("userId", userId);
            SpaceUser existingMember = spaceUserService.getOne(queryWrapper);
            if (existingMember != null) {
                continue; // 跳过已在空间中的用户
            }

            // 添加成员
            SpaceUser spaceUser = new SpaceUser();
            spaceUser.setSpaceId(batchAddRequest.getSpaceId());
            spaceUser.setUserId(userId);
            spaceUser.setRole(batchAddRequest.getRole());

            if (spaceUserService.save(spaceUser)) {
                addedCount++;
            }
        }

        // 更新空间成员数量
        if (addedCount > 0) {
            Space updateSpace = new Space();
            updateSpace.setId(batchAddRequest.getSpaceId());
            updateSpace.setMemberCount(space.getMemberCount() + addedCount);
            spaceService.updateById(updateSpace);
        }

        return ResultUtils.success(true);
    }

    @PostMapping("/remove/member")
    public BaseResponse<Boolean> removeMember(@RequestBody SpaceUserRemoveRequest spaceUserRemoveRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceUserRemoveRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        Space space = spaceService.getById(spaceUserRemoveRequest.getSpaceId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        // 只有空间所有者可以移除成员
        ThrowUtils.throwIf(!space.getOwnerId().equals(loginUser.getId()), ErrorCode.NO_AUTH_ERROR);

        // 不能移除空间所有者
        ThrowUtils.throwIf(spaceUserRemoveRequest.getUserId().equals(space.getOwnerId()), ErrorCode.OPERATION_ERROR, "不能移除空间所有者");

        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("spaceId", spaceUserRemoveRequest.getSpaceId());
        queryWrapper.eq("userId", spaceUserRemoveRequest.getUserId());
        SpaceUser spaceUser = spaceUserService.getOne(queryWrapper);
        ThrowUtils.throwIf(spaceUser == null, ErrorCode.NOT_FOUND_ERROR, "用户不在空间中");

        boolean result = spaceUserService.removeById(spaceUser.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        // 更新空间成员数量
        Space updateSpace = new Space();
        updateSpace.setId(space.getId());
        updateSpace.setMemberCount(space.getMemberCount() - 1);
        spaceService.updateById(updateSpace);

        return ResultUtils.success(true);
    }

    @GetMapping("/list/members")
    public BaseResponse<List<SpaceUserVO>> listSpaceMembers(Long spaceId, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceId == null || spaceId <= 0, ErrorCode.PARAMS_ERROR);

        Space space = spaceService.getById(spaceId);
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.eq("spaceId", spaceId);
        List<SpaceUser> spaceUserList = spaceUserService.list(queryWrapper);

        List<SpaceUserVO> spaceUserVOList = spaceUserList.stream().map(spaceUser -> {
            SpaceUserVO spaceUserVO = new SpaceUserVO();
            spaceUserVO.setId(spaceUser.getId());
            spaceUserVO.setSpaceId(spaceUser.getSpaceId());
            spaceUserVO.setUserId(spaceUser.getUserId());
            spaceUserVO.setRole(spaceUser.getRole());
            SpaceUserRoleEnum roleEnum = SpaceUserRoleEnum.getEnumByValue(spaceUser.getRole());
            spaceUserVO.setRoleText(roleEnum != null ? roleEnum.getText() : "");
            spaceUserVO.setPermissions(spaceUser.getPermissions());
            spaceUserVO.setJoinTime(spaceUser.getJoinTime());

            User user = userService.getById(spaceUser.getUserId());
            if (user != null) {
                spaceUserVO.setUserName(user.getUserName());
                spaceUserVO.setUserAvatar(user.getUserAvatar());
            }

            return spaceUserVO;
        }).toList();

        return ResultUtils.success(spaceUserVOList);
    }

    @PostMapping("/apps/list/page")
    public BaseResponse<Page<AppVO>> listSpaceApps(@RequestBody AppQueryRequest appQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(appQueryRequest == null || appQueryRequest.getSpaceId() == null || appQueryRequest.getSpaceId() <= 0, ErrorCode.PARAMS_ERROR);

        Space space = spaceService.getById(appQueryRequest.getSpaceId());
        ThrowUtils.throwIf(space == null, ErrorCode.NOT_FOUND_ERROR);

        Integer current = appQueryRequest.getPageNum();
        Integer pageSize = appQueryRequest.getPageSize();

        Page<AppVO> appVOPage = appService.listAppVOByPageForSpace(appQueryRequest.getSpaceId(), current, pageSize);
        return ResultUtils.success(appVOPage);
    }

    @PostMapping("/app/add")
    public BaseResponse<Boolean> addAppToSpace(@RequestBody SpaceAppRequest spaceAppRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceAppRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        boolean result = appService.addAppToSpace(spaceAppRequest.getAppId(), spaceAppRequest.getSpaceId(), loginUser.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        // 更新空间应用数量
        Space space = spaceService.getById(spaceAppRequest.getSpaceId());
        Space updateSpace = new Space();
        updateSpace.setId(spaceAppRequest.getSpaceId());
        updateSpace.setAppCount(space.getAppCount() + 1);
        spaceService.updateById(updateSpace);

        return ResultUtils.success(true);
    }

    @PostMapping("/app/remove")
    public BaseResponse<Boolean> removeAppFromSpace(@RequestBody SpaceAppRequest spaceAppRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceAppRequest == null, ErrorCode.PARAMS_ERROR);

        User loginUser = userService.getLoginUser(request);

        boolean result = appService.removeAppFromSpace(spaceAppRequest.getAppId(), spaceAppRequest.getSpaceId(), loginUser.getId());
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        // 更新空间应用数量
        Space space = spaceService.getById(spaceAppRequest.getSpaceId());
        Space updateSpace = new Space();
        updateSpace.setId(spaceAppRequest.getSpaceId());
        updateSpace.setAppCount(space.getAppCount() - 1);
        spaceService.updateById(updateSpace);

        return ResultUtils.success(true);
    }
}