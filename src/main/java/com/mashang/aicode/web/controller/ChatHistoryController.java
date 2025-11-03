package com.mashang.aicode.web.controller;

import com.mashang.aicode.web.annotation.AuthCheck;
import com.mashang.aicode.web.common.BaseResponse;
import com.mashang.aicode.web.common.DeleteRequest;
import com.mashang.aicode.web.common.ResultUtils;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.model.dto.chat.ChatHistoryAddRequest;
import com.mashang.aicode.web.model.dto.chat.ChatHistoryQueryRequest;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.ChatHistory;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.ChatHistoryVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 对话历史 控制层
 */
@RestController
@RequestMapping("/chat/history")
public class ChatHistoryController {

    @Resource
    private ChatHistoryService chatHistoryService;

    @Resource
    private UserService userService;

    @Resource
    private AppService appService;

    /**
     * 【用户】保存用户消息
     */
    @PostMapping("/save/user")
    public BaseResponse<Boolean> saveUserMessage(@RequestBody ChatHistoryAddRequest chatHistoryAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(chatHistoryAddRequest == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 校验参数
        Long appId = chatHistoryAddRequest.getAppId();
        String messageContent = chatHistoryAddRequest.getMessageContent();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(messageContent == null || messageContent.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "消息内容不能为空");

        // 校验应用是否存在
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 保存用户消息
        boolean result = chatHistoryService.saveUserMessage(appId, loginUser.getId(), messageContent);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 【用户】保存AI消息
     */
    @PostMapping("/save/ai")
    public BaseResponse<Boolean> saveAIMessage(@RequestBody ChatHistoryAddRequest chatHistoryAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(chatHistoryAddRequest == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 校验参数
        Long appId = chatHistoryAddRequest.getAppId();
        String messageContent = chatHistoryAddRequest.getMessageContent();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(messageContent == null || messageContent.trim().isEmpty(), ErrorCode.PARAMS_ERROR, "消息内容不能为空");

        // 校验应用是否存在
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 保存AI消息
        boolean result = chatHistoryService.saveAIMessage(appId, loginUser.getId(), messageContent);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
    }

    /**
     * 游标查询
     * @param appId
     * @param pageSize
     * @param lastCreateTime
     * @param request
     * @return
     */
    @GetMapping("/app/{appId}")
    public BaseResponse<Page<ChatHistory>> listAppChatHistory(@PathVariable Long appId,
                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                              @RequestParam(required = false) LocalDateTime lastCreateTime,
                                                              HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        Page<ChatHistory> result = chatHistoryService.listAppChatHistoryByPage(appId, pageSize, lastCreateTime, loginUser);
        return ResultUtils.success(result);
    }



    /**
     * 【用户】分页查询某个应用的对话历史（按时间倒序）
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<ChatHistoryVO>> listChatHistoryVOByPage(@RequestBody ChatHistoryQueryRequest chatHistoryQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(chatHistoryQueryRequest == null, ErrorCode.PARAMS_ERROR);

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 校验应用ID
        Long appId = chatHistoryQueryRequest.getAppId();
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");

        // 校验应用是否存在
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 校验权限（只能查看自己的应用或精选应用）
        if (!app.getUserId().equals(loginUser.getId()) && app.getPriority() != 1) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        Page<ChatHistoryVO> chatHistoryVOPage = chatHistoryService.listVOByAppId(appId,
                (long) chatHistoryQueryRequest.getPageNum(), (long) chatHistoryQueryRequest.getPageSize());
        return ResultUtils.success(chatHistoryVOPage);
    }

    /**
     * 【用户】查询某个应用的最新对话历史（用于进入应用时加载）
     */
    @GetMapping("/list/latest/vo")
    public BaseResponse<List<ChatHistoryVO>> listLatestChatHistoryVO(@RequestParam Long appId, HttpServletRequest request) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");

        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        // 校验应用是否存在
        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");

        // 校验权限（只能查看自己的应用或精选应用）
        if (!app.getUserId().equals(loginUser.getId()) && app.getPriority() != 1) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 查询最新10条对话历史
        List<ChatHistoryVO> chatHistoryVOList = chatHistoryService.listLatestVOByAppId(appId, 10);
        return ResultUtils.success(chatHistoryVOList);
    }

    /**
     * 【管理员】根据 id 删除对话历史
     */
    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteChatHistory(@RequestBody DeleteRequest deleteRequest) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean b = chatHistoryService.removeById(deleteRequest.getId());
        return ResultUtils.success(b);
    }

    /**
     * 【管理员】根据 id 获取对话历史
     */
    @GetMapping("/get")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<ChatHistory> getChatHistoryById(long id) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        ChatHistory chatHistory = chatHistoryService.getById(id);
        ThrowUtils.throwIf(chatHistory == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(chatHistory);
    }

    /**
     * 【管理员】分页查询所有对话历史（按时间倒序排列）
     */
    @PostMapping("/list/all/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ChatHistory>> listAllChatHistoryByPage(@RequestBody ChatHistoryQueryRequest chatHistoryQueryRequest) {
        ThrowUtils.throwIf(chatHistoryQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = chatHistoryQueryRequest.getPageNum();
        long pageSize = chatHistoryQueryRequest.getPageSize();

        Page<ChatHistory> chatHistoryPage = chatHistoryService.page(Page.of(pageNum, pageSize), 
                chatHistoryService.getQueryWrapper(chatHistoryQueryRequest));
        return ResultUtils.success(chatHistoryPage);
    }

    /**
     * 【管理员】分页查询所有对话历史VO（按时间倒序排列）
     */
    @PostMapping("/list/all/page/vo")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ChatHistoryVO>> listAllChatHistoryVOByPage(@RequestBody ChatHistoryQueryRequest chatHistoryQueryRequest) {
        ThrowUtils.throwIf(chatHistoryQueryRequest == null, ErrorCode.PARAMS_ERROR);

        long pageNum = chatHistoryQueryRequest.getPageNum();
        long pageSize = chatHistoryQueryRequest.getPageSize();

        Page<ChatHistory> chatHistoryPage = chatHistoryService.page(Page.of(pageNum, pageSize), 
                chatHistoryService.getQueryWrapper(chatHistoryQueryRequest));
        
        // 转换为VO
        Page<ChatHistoryVO> chatHistoryVOPage = new Page<>(pageNum, pageSize, chatHistoryPage.getTotalRow());
        List<ChatHistoryVO> chatHistoryVOList = chatHistoryService.getChatHistoryVOList(chatHistoryPage.getRecords());
        chatHistoryVOPage.setRecords(chatHistoryVOList);
        
        return ResultUtils.success(chatHistoryVOPage);
    }
}