package com.mashang.aicode.web.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mashang.aicode.web.model.dto.forum.ForumPostQueryRequest;
import com.mashang.aicode.web.model.entity.ForumPost;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.ForumPostSimpleVO;
import com.mashang.aicode.web.model.vo.ForumPostVO;

import java.util.List;

public interface ForumPostService extends IService<ForumPost> {

    ForumPostVO getForumPostVO(ForumPost forumPost);

    List<ForumPostVO> getForumPostVOList(List<ForumPost> forumPostList);

    ForumPostSimpleVO getForumPostSimpleVO(ForumPost forumPost);

    List<ForumPostSimpleVO> getForumPostSimpleVOList(List<ForumPost> forumPostList);

    QueryWrapper getQueryWrapper(ForumPostQueryRequest forumPostQueryRequest);

    Page<ForumPostVO> listForumPostVOByPage(ForumPostQueryRequest forumPostQueryRequest);

    Page<ForumPostSimpleVO> listForumPostSimpleVOByPage(ForumPostQueryRequest forumPostQueryRequest);

    Long addForumPost(ForumPost forumPost, User loginUser);

    boolean updateForumPost(ForumPost forumPost, User loginUser);

    boolean deleteForumPost(Long id, User loginUser);

    boolean incrementViewCount(Long id);

    boolean incrementLikeCount(Long id);

    boolean decrementLikeCount(Long id);

    List<ForumPostVO> listHotPosts(int limit);

}
