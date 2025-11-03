package com.mashang.aicode.web.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.mashang.aicode.web.constant.UserConstant;
import com.mashang.aicode.web.model.entity.App;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.enums.ChatHistoryMessageTypeEnum;
import com.mashang.aicode.web.exception.ErrorCode;
import com.mashang.aicode.web.exception.ThrowUtils;
import com.mashang.aicode.web.mapper.ChatHistoryMapper;
import com.mashang.aicode.web.model.dto.chat.ChatHistoryQueryRequest;
import com.mashang.aicode.web.model.entity.ChatHistory;
import com.mashang.aicode.web.model.vo.ChatHistoryVO;
import com.mashang.aicode.web.service.AppService;
import com.mashang.aicode.web.service.ChatHistoryService;
import com.mashang.aicode.web.service.UserService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.mashang.aicode.web.model.entity.table.ChatHistoryTableDef.CHAT_HISTORY;

/**
 * 对话历史 服务实现层
 */
@Service
@Slf4j
public class ChatHistoryServiceImpl extends ServiceImpl<ChatHistoryMapper, ChatHistory> implements ChatHistoryService {

    @Resource
    private UserService userService;

    @Resource
    @Lazy
    private AppService appService;

    @Override
    public boolean saveUserMessage(Long appId, Long userId, String messageContent) {
        ChatHistory chatHistory = ChatHistory.builder()
                .appId(appId)
                .userId(userId)
                .messageType(ChatHistoryMessageTypeEnum.USER.getValue())
                .messageContent(messageContent)
                .createTime(LocalDateTime.now())
                .updateTime(LocalDateTime.now())
                .build();
        return save(chatHistory);
    }

    @Override
    public int loadChatHistoryToMemory(Long appId, MessageWindowChatMemory chatMemory, int maxCount) {
        try {
            QueryWrapper queryWrapper = QueryWrapper.create()
                    .eq(ChatHistory::getAppId, appId)
                    .orderBy(ChatHistory::getCreateTime, false)
                    .limit(1, maxCount);
            List<ChatHistory> historyList = this.list(queryWrapper);
            if (CollUtil.isEmpty(historyList)) {
                return 0;
            }
            historyList = historyList.reversed();
            int loadedCount = 0;
            chatMemory.clear();
            for (ChatHistory history : historyList) {
                if (ChatHistoryMessageTypeEnum.USER.getValue().equals(history.getMessageType())) {
                    chatMemory.add(UserMessage.from(history.getMessageContent()));
                    loadedCount++;
                } else if (ChatHistoryMessageTypeEnum.AI.getValue().equals(history.getMessageType())) {
                    chatMemory.add(AiMessage.from(history.getMessageContent()));
                    loadedCount++;
                }
            }
            log.info("成功为 appId: {} 加载了 {} 条历史对话", appId, loadedCount);
            return loadedCount;
        } catch (Exception e) {
            log.error("加载历史对话失败，appId: {}, error: {}", appId, e.getMessage(), e);
            return 0;
        }
    }



    @Override
    public boolean saveAIMessage(Long appId, Long userId, String messageContent) {
        ChatHistory chatHistory = ChatHistory.builder()
                .appId(appId)
                .userId(userId)
                .messageType(ChatHistoryMessageTypeEnum.AI.getValue())
                .messageContent(messageContent)
                .createTime(LocalDateTime.now())
                .updateTime(LocalDateTime.now())
                .build();
        return save(chatHistory);
    }

    @Override
    public Page<ChatHistory> listByAppId(Long appId, Long pageNum, Long pageSize) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(pageNum == null || pageNum <= 0, ErrorCode.PARAMS_ERROR, "页码不能为空");
        ThrowUtils.throwIf(pageSize == null || pageSize <= 0, ErrorCode.PARAMS_ERROR, "页面大小不能为空");
        
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq("appId", appId)
                .orderBy("createTime", false);
        
        return this.page(Page.of(pageNum, pageSize), queryWrapper);
    }

    @Override
    public Page<ChatHistory> listAppChatHistoryByPage(Long appId, int pageSize,
                                                      LocalDateTime lastCreateTime,
                                                      User loginUser) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(pageSize <= 0 || pageSize > 50, ErrorCode.PARAMS_ERROR, "页面大小必须在1-50之间");
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR);

        App app = appService.getById(appId);
        ThrowUtils.throwIf(app == null, ErrorCode.NOT_FOUND_ERROR, "应用不存在");
        boolean isAdmin = UserConstant.ADMIN_ROLE.equals(loginUser.getUserRole());
        boolean isCreator = app.getUserId().equals(loginUser.getId());
        ThrowUtils.throwIf(!isAdmin && !isCreator, ErrorCode.NO_AUTH_ERROR, "无权查看该应用的对话历史");

        //游标查询，即记录上一次分页查到的最后一条位置，然后下一次分页就会启用该位置为起始点查询，好处就是不用从头翻起
        ChatHistoryQueryRequest queryRequest = new ChatHistoryQueryRequest();
        queryRequest.setAppId(appId);
        queryRequest.setLastCreateTime(lastCreateTime);
        QueryWrapper queryWrapper = this.getQueryWrapper(queryRequest);

        return this.page(Page.of(1, pageSize), queryWrapper);
    }

    @Override
    public Page<ChatHistoryVO> listVOByAppId(Long appId, Long pageNum, Long pageSize) {
        Page<ChatHistory> chatHistoryPage = listByAppId(appId, pageNum, pageSize);
        Page<ChatHistoryVO> chatHistoryVOPage = new Page<>(pageNum, pageSize, chatHistoryPage.getTotalRow());
        List<ChatHistoryVO> chatHistoryVOList = getChatHistoryVOList(chatHistoryPage.getRecords());
        chatHistoryVOPage.setRecords(chatHistoryVOList);
        return chatHistoryVOPage;
    }

    @Override
    public List<ChatHistory> listLatestByAppId(Long appId, int limit) {
        QueryWrapper queryWrapper = new QueryWrapper();
        queryWrapper.where(CHAT_HISTORY.APP_ID.eq(appId))
                .and(CHAT_HISTORY.IS_DELETE.eq(0))
                .orderBy(CHAT_HISTORY.CREATE_TIME.desc())
                .limit(limit);
        return list(queryWrapper);
    }

    @Override
    public List<ChatHistoryVO> listLatestVOByAppId(Long appId, int limit) {
        List<ChatHistory> chatHistoryList = listLatestByAppId(appId, limit);
        return getChatHistoryVOList(chatHistoryList);
    }

    @Override
    public boolean deleteByAppId(Long appId) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        QueryWrapper queryWrapper = QueryWrapper.create()
                .eq("appId", appId);
        return this.remove(queryWrapper);
    }



    @Override
    public ChatHistoryVO getChatHistoryVO(ChatHistory chatHistory) {
        if (chatHistory == null) {
            return null;
        }
        ChatHistoryVO chatHistoryVO = new ChatHistoryVO();
        BeanUtil.copyProperties(chatHistory, chatHistoryVO);

//        // 设置消息类型描述
//        ChatHistoryMessageTypeEnum messageTypeEnum = ChatHistoryMessageTypeEnum.getEnumByValue(chatHistory.getMessageType());
//        if (messageTypeEnum != null) {
//            chatHistoryVO.setMessageTypeDesc(messageTypeEnum.getDescription());
//        }

        // 设置用户信息
        if (chatHistory.getUserId() != null) {
            chatHistoryVO.setUser(userService.getUserVO(userService.getById(chatHistory.getUserId())));
        }

        // 设置应用信息
        if (chatHistory.getAppId() != null) {
            chatHistoryVO.setApp(appService.getAppVO(appService.getById(chatHistory.getAppId())));
        }

        return chatHistoryVO;
    }

    @Override
    public List<ChatHistoryVO> getChatHistoryVOList(List<ChatHistory> chatHistoryList) {
        return chatHistoryList.stream()
                .map(this::getChatHistoryVO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean addChatMessage(Long appId, String message, String messageType, Long userId) {
        ThrowUtils.throwIf(appId == null || appId <= 0, ErrorCode.PARAMS_ERROR, "应用ID不能为空");
        ThrowUtils.throwIf(StrUtil.isBlank(message), ErrorCode.PARAMS_ERROR, "消息内容不能为空");
        ThrowUtils.throwIf(StrUtil.isBlank(messageType), ErrorCode.PARAMS_ERROR, "消息类型不能为空");
        ThrowUtils.throwIf(userId == null || userId <= 0, ErrorCode.PARAMS_ERROR, "用户ID不能为空");

        ChatHistoryMessageTypeEnum messageTypeEnum = ChatHistoryMessageTypeEnum.getEnumByValue(messageType);
        ThrowUtils.throwIf(messageTypeEnum == null, ErrorCode.PARAMS_ERROR, "不支持的消息类型: " + messageType);
        ChatHistory chatHistory = ChatHistory.builder()
                .appId(appId)
                .messageContent(message)
                .messageType(messageType)
                .userId(userId)
                .build();
        return this.save(chatHistory);
    }

    @Override
    public QueryWrapper getQueryWrapper(ChatHistoryQueryRequest chatHistoryQueryRequest) {
        QueryWrapper queryWrapper = QueryWrapper.create();
        if (chatHistoryQueryRequest == null) {
            return queryWrapper;
        }
        Long id = chatHistoryQueryRequest.getId();
        String message = chatHistoryQueryRequest.getMessage();
        String messageType = chatHistoryQueryRequest.getMessageType();
        Long appId = chatHistoryQueryRequest.getAppId();
        Long userId = chatHistoryQueryRequest.getUserId();
        LocalDateTime lastCreateTime = chatHistoryQueryRequest.getLastCreateTime();
        String sortField = chatHistoryQueryRequest.getSortField();
        String sortOrder = chatHistoryQueryRequest.getSortOrder();

        queryWrapper.eq("id", id)
                .like("message", message)
                .eq("messageType", messageType)
                .eq("appId", appId)
                .eq("userId", userId);

        if (lastCreateTime != null) {
            queryWrapper.lt("createTime", lastCreateTime);
        }

        if (StrUtil.isNotBlank(sortField)) {
            queryWrapper.orderBy(sortField, "ascend".equals(sortOrder));
        } else {

            queryWrapper.orderBy("createTime", false);
        }
        return queryWrapper;
    }


}