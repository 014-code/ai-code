package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.mapper.AppMapper;
import com.mashang.aicode.web.mapper.ForumPostMapper;
import com.mashang.aicode.web.mapper.UserMapper;
import com.mashang.aicode.web.model.dto.forum.ForumPostQueryRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.ForumPost;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.AppVO;
import com.mashang.aicode.web.model.vo.ForumPostSimpleVO;
import com.mashang.aicode.web.model.vo.ForumPostVO;
import com.mashang.aicode.web.model.vo.UserVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.ForumPostService;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ForumPostServiceImpl extends ServiceImpl<ForumPostMapper, ForumPost> implements ForumPostService {

    @Resource
    private UserService userService;

    @Resource
    private UserMapper userMapper;

    @Resource
    private AppService appService;

    @Resource
    private AppMapper appMapper;

    @Override
    public ForumPostVO getForumPostVO(ForumPost forumPost) {
        if (forumPost == null) {
            return null;
        }
        ForumPostVO forumPostVO = new ForumPostVO();
        BeanUtil.copyProperties(forumPost, forumPostVO);

        if (forumPost.getUserId() != null) {
            User user = userMapper.selectById(forumPost.getUserId());
            if (user != null) {
                UserVO userVO = userService.getUserVO(user);
                forumPostVO.setUser(userVO);
            }
        }

        if (forumPost.getAppId() != null) {
            App app = appMapper.selectById(forumPost.getAppId());
            if (app != null) {
                AppVO appVO = appService.getAppVO(app);
                forumPostVO.setApp(appVO);
            }
        }

        return forumPostVO;
    }

    @Override
    public List<ForumPostVO> getForumPostVOList(List<ForumPost> forumPostList) {
        if (CollUtil.isEmpty(forumPostList)) {
            return new ArrayList<>();
        }

        List<Long> userIds = forumPostList.stream().map(ForumPost::getUserId).distinct().collect(Collectors.toList());
        List<Long> appIds = forumPostList.stream().filter(post -> post.getAppId() != null).map(ForumPost::getAppId).distinct().collect(Collectors.toList());

        Map<Long, UserVO> userVOMap = userMapper.selectList(new LambdaQueryWrapper<User>().select(User::getId, User::getUserName, User::getUserAvatar).in(User::getId, userIds)).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        Map<Long, AppVO> appVOMap = new java.util.HashMap<>();
        if (CollUtil.isNotEmpty(appIds)) {
            appVOMap = appMapper.selectList(new LambdaQueryWrapper<App>().select(App::getId, App::getAppName, App::getCover).in(App::getId, appIds)).stream().map(appService::getAppVO).collect(Collectors.toMap(AppVO::getId, appVO -> appVO));
        }

        Map<Long, AppVO> finalAppVOMap = appVOMap;
        return forumPostList.stream().map(post -> {
            ForumPostVO forumPostVO = new ForumPostVO();
            BeanUtil.copyProperties(post, forumPostVO);
            forumPostVO.setUser(userVOMap.get(post.getUserId()));
            if (post.getAppId() != null) {
                forumPostVO.setApp(finalAppVOMap.get(post.getAppId()));
            }
            return forumPostVO;
        }).collect(Collectors.toList());
    }

    @Override
    public ForumPostSimpleVO getForumPostSimpleVO(ForumPost forumPost) {
        if (forumPost == null) {
            return null;
        }
        ForumPostSimpleVO forumPostSimpleVO = new ForumPostSimpleVO();
        BeanUtil.copyProperties(forumPost, forumPostSimpleVO);

        if (forumPost.getUserId() != null) {
            User user = userMapper.selectById(forumPost.getUserId());
            if (user != null) {
                UserVO userVO = userService.getUserVO(user);
                forumPostSimpleVO.setUser(userVO);
            }
        }

        if (forumPost.getAppId() != null) {
            App app = appMapper.selectById(forumPost.getAppId());
            if (app != null) {
                AppVO appVO = appService.getAppVO(app);
                forumPostSimpleVO.setApp(appVO);
            }
        }

        return forumPostSimpleVO;
    }

    @Override
    public List<ForumPostSimpleVO> getForumPostSimpleVOList(List<ForumPost> forumPostList) {
        if (CollUtil.isEmpty(forumPostList)) {
            return new ArrayList<>();
        }

        List<Long> userIds = forumPostList.stream().map(ForumPost::getUserId).distinct().collect(Collectors.toList());
        List<Long> appIds = forumPostList.stream().filter(post -> post.getAppId() != null).map(ForumPost::getAppId).distinct().collect(Collectors.toList());

        Map<Long, UserVO> userVOMap = userMapper.selectList(new LambdaQueryWrapper<User>().select(User::getId, User::getUserName, User::getUserAvatar).in(User::getId, userIds)).stream().map(userService::getUserVO).collect(Collectors.toMap(UserVO::getId, userVO -> userVO));

        Map<Long, AppVO> appVOMap = new java.util.HashMap<>();
        if (CollUtil.isNotEmpty(appIds)) {
            appVOMap = appMapper.selectList(new LambdaQueryWrapper<App>().select(App::getId, App::getAppName, App::getCover).in(App::getId, appIds)).stream().map(appService::getAppVO).collect(Collectors.toMap(AppVO::getId, appVO -> appVO));
        }

        Map<Long, AppVO> finalAppVOMap = appVOMap;
        return forumPostList.stream().map(post -> {
            ForumPostSimpleVO forumPostSimpleVO = new ForumPostSimpleVO();
            BeanUtil.copyProperties(post, forumPostSimpleVO);
            forumPostSimpleVO.setUser(userVOMap.get(post.getUserId()));
            if (post.getAppId() != null) {
                forumPostSimpleVO.setApp(finalAppVOMap.get(post.getAppId()));
            }
            return forumPostSimpleVO;
        }).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper getQueryWrapper(ForumPostQueryRequest forumPostQueryRequest) {
        if (forumPostQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }

        Long id = forumPostQueryRequest.getId();
        String title = forumPostQueryRequest.getTitle();
        String searchKey = forumPostQueryRequest.getSearchKey();
        Long appId = forumPostQueryRequest.getAppId();
        Long userId = forumPostQueryRequest.getUserId();
        Integer isPinned = forumPostQueryRequest.getIsPinned();

        QueryWrapper<ForumPost> queryWrapper = new QueryWrapper<>();

        if (id != null) {
            queryWrapper.eq("id", id);
        }
        if (StrUtil.isNotBlank(searchKey)) {
            queryWrapper.and(wrapper -> wrapper.like("title", "%" + searchKey + "%").or().like("content", "%" + searchKey + "%"));
        } else if (StrUtil.isNotBlank(title)) {
            queryWrapper.like("title", "%" + title + "%");
        }
        if (appId != null) {
            queryWrapper.eq("appId", appId);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (isPinned != null) {
            queryWrapper.eq("isPinned", isPinned);
        }

        queryWrapper.orderByDesc("isPinned").orderByDesc("createTime");

        return queryWrapper;
    }

    @Override
    public Page<ForumPostVO> listForumPostVOByPage(ForumPostQueryRequest forumPostQueryRequest) {
        ThrowUtils.throwIf(forumPostQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = forumPostQueryRequest.getPageNum();
        long pageSize = forumPostQueryRequest.getPageSize();

        if (pageSize > 20) {
            pageSize = 20;
        }

        QueryWrapper queryWrapper = getQueryWrapper(forumPostQueryRequest);

        Page<ForumPost> forumPostPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<ForumPostVO> forumPostVOPage = new Page<>(pageNum, pageSize, forumPostPage.getTotal());
        List<ForumPostVO> forumPostVOList = getForumPostVOList(forumPostPage.getRecords());
        forumPostVOPage.setRecords(forumPostVOList);

        return forumPostVOPage;
    }

    @Override
    public Page<ForumPostSimpleVO> listForumPostSimpleVOByPage(ForumPostQueryRequest forumPostQueryRequest) {
        ThrowUtils.throwIf(forumPostQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = forumPostQueryRequest.getPageNum();
        long pageSize = forumPostQueryRequest.getPageSize();

        if (pageSize > 20) {
            pageSize = 20;
        }

        QueryWrapper queryWrapper = getQueryWrapper(forumPostQueryRequest);

        Page<ForumPost> forumPostPage = this.page(new Page<>(pageNum, pageSize), queryWrapper);

        // 数据转换
        Page<ForumPostSimpleVO> forumPostSimpleVOPage = new Page<>(pageNum, pageSize, forumPostPage.getTotal());
        List<ForumPostSimpleVO> forumPostSimpleVOList = getForumPostSimpleVOList(forumPostPage.getRecords());
        forumPostSimpleVOPage.setRecords(forumPostSimpleVOList);

        return forumPostSimpleVOPage;
    }

    @Override
    public Long addForumPost(ForumPost forumPost, User loginUser) {
        ThrowUtils.throwIf(forumPost == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR);
        ThrowUtils.throwIf(StrUtil.isBlank(forumPost.getTitle()), ErrorCode.PARAMS_ERROR, "标题不能为空");
        ThrowUtils.throwIf(StrUtil.isBlank(forumPost.getContent()), ErrorCode.PARAMS_ERROR, "内容不能为空");

        forumPost.setUserId(loginUser.getId());
        forumPost.setViewCount(0);
        forumPost.setLikeCount(0);
        forumPost.setCommentCount(0);
        forumPost.setIsPinned(0);
        forumPost.setIsDelete(0);

        boolean saved = this.save(forumPost);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR, "保存失败");

        return forumPost.getId();
    }

    @Override
    public boolean updateForumPost(ForumPost forumPost, User loginUser) {
        ThrowUtils.throwIf(forumPost == null || forumPost.getId() == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR);

        ForumPost existingPost = this.getById(forumPost.getId());
        ThrowUtils.throwIf(existingPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        if (!existingPost.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限修改该帖子");
        }

        boolean updated = this.updateById(forumPost);
        ThrowUtils.throwIf(!updated, ErrorCode.OPERATION_ERROR, "更新失败");

        return true;
    }

    @Override
    public boolean deleteForumPost(Long id, User loginUser) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR);

        ForumPost forumPost = this.getById(id);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        if (!forumPost.getUserId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权限删除该帖子");
        }

        boolean deleted = this.removeById(id);
        ThrowUtils.throwIf(!deleted, ErrorCode.OPERATION_ERROR, "删除失败");

        return true;
    }

    @Override
    public boolean incrementViewCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        ForumPost forumPost = this.getById(id);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        ForumPost updatePost = new ForumPost();
        updatePost.setId(id);
        updatePost.setViewCount((forumPost.getViewCount() == null ? 0 : forumPost.getViewCount()) + 1);

        return this.updateById(updatePost);
    }

    @Override
    public boolean incrementLikeCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        ForumPost forumPost = this.getById(id);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        ForumPost updatePost = new ForumPost();
        updatePost.setId(id);
        updatePost.setLikeCount((forumPost.getLikeCount() == null ? 0 : forumPost.getLikeCount()) + 1);

        return this.updateById(updatePost);
    }

    @Override
    public boolean decrementLikeCount(Long id) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);

        ForumPost forumPost = this.getById(id);
        ThrowUtils.throwIf(forumPost == null, ErrorCode.NOT_FOUND_ERROR, "帖子不存在");

        int currentLikeCount = forumPost.getLikeCount() == null ? 0 : forumPost.getLikeCount();
        if (currentLikeCount <= 0) {
            return true;
        }

        ForumPost updatePost = new ForumPost();
        updatePost.setId(id);
        updatePost.setLikeCount(currentLikeCount - 1);

        return this.updateById(updatePost);
    }

    @Override
    public List<ForumPostVO> listHotPosts(int limit) {
        ThrowUtils.throwIf(limit <= 0, ErrorCode.PARAMS_ERROR);

        QueryWrapper<ForumPost> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("isPinned")
                .orderByDesc("likeCount")
                .orderByDesc("viewCount")
                .orderByDesc("commentCount")
                .orderByDesc("createTime")
                .last("LIMIT " + limit);

        List<ForumPost> forumPostList = this.list(queryWrapper);
        return getForumPostVOList(forumPostList);
    }
}
