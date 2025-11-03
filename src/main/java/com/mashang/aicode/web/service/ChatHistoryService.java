package com.mashang.aicode.web.service;

import com.mashang.aicode.web.model.dto.chat.ChatHistoryQueryRequest;
import com.mashang.aicode.web.model.entity.ChatHistory;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.model.vo.ChatHistoryVO;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 对话历史 服务层
 */
@Service
public interface ChatHistoryService extends IService<ChatHistory> {

    /**
     * 保存用户消息
     *
     * @param appId          应用id
     * @param userId         用户id
     * @param messageContent 消息内容
     * @return 保存结果
     */
    boolean saveUserMessage(Long appId, Long userId, String messageContent);

    /**
     * 保存AI消息
     *
     * @param appId          应用id
     * @param userId         用户id
     * @param messageContent 消息内容
     * @return 保存结果
     */
    boolean saveAIMessage(Long appId, Long userId, String messageContent);

    /**
     * 根据应用id分页查询对话历史（按时间倒序）
     *
     * @param appId    应用id
     * @param pageNum  页码
     * @param pageSize 页面大小
     * @return 分页结果
     */
    Page<ChatHistory> listByAppId(Long appId, Long pageNum, Long pageSize);

    /**
     * 根据应用id分页查询对话历史VO（按时间倒序）
     *
     * @param appId    应用id
     * @param pageNum  页码
     * @param pageSize 页面大小
     * @return 分页结果
     */
    Page<ChatHistoryVO> listVOByAppId(Long appId, Long pageNum, Long pageSize);

    /**
     * 查询某个应用的最新对话历史（用于进入应用时加载）
     *
     * @param appId 应用id
     * @param limit 限制条数
     * @return 对话历史列表
     */
    List<ChatHistory> listLatestByAppId(Long appId, int limit);

    /**
     * 查询某个应用的最新对话历史VO（用于进入应用时加载）
     *
     * @param appId 应用id
     * @param limit 限制条数
     * @return 对话历史VO列表
     */
    List<ChatHistoryVO> listLatestVOByAppId(Long appId, int limit);

    /**
     * 根据应用id删除所有对话历史（应用删除时使用）
     *
     * @param appId 应用id
     * @return 删除结果
     */
    boolean deleteByAppId(Long appId);

    /**
     * 获取脱敏后的对话历史信息
     *
     * @param chatHistory 对话历史
     * @return 脱敏后的对话历史信息
     */
    ChatHistoryVO getChatHistoryVO(ChatHistory chatHistory);

    /**
     * 获取脱敏后的对话历史信息（分页）
     *
     * @param chatHistoryList 对话历史列表
     * @return 脱敏后的对话历史信息列表
     */
    List<ChatHistoryVO> getChatHistoryVOList(List<ChatHistory> chatHistoryList);

    /**
     * 根据查询条件构造数据查询参数
     *
     * @param chatHistoryQueryRequest 查询请求
     * @return 查询包装器
     */
    QueryWrapper getQueryWrapper(ChatHistoryQueryRequest chatHistoryQueryRequest);

    /**
     * 新增对话历史
     *
     * @param appId
     * @param message
     * @param messageType
     * @param userId
     * @return
     */
    boolean addChatMessage(Long appId, String message, String messageType, Long userId);

    /**
     * 基于游标分页查询应用历史消息列表
     * @param appId
     * @param pageSize
     * @param lastCreateTime
     * @param loginUser
     * @return
     */
    Page<ChatHistory> listAppChatHistoryByPage(Long appId, int pageSize,
                                               LocalDateTime lastCreateTime,
                                               User loginUser);

    /**
     * 从数据库中加载对话历史到记忆中
     * @param appId
     * @param chatMemory
     * @param maxCount
     * @return
     */
    int loadChatHistoryToMemory(Long appId, MessageWindowChatMemory chatMemory, int maxCount);


}