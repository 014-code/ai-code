package com.mashang.aicode.web.manager.task;

import com.mashang.aicode.web.service.ChatHistoryService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.Disposable;
import reactor.core.publisher.FluxSink;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 代码生成任务管理器
 * 用于管理正在进行的代码生成任务，支持取消操作
 */
@Slf4j
@Component
public class GenerationTaskManager {

    @Resource
    private ChatHistoryService chatHistoryService;

    /**
     * 存储正在进行的生成任务
     * key: appId, value: 任务信息
     */
    private final Map<Long, GenerationTask> activeTasks = new ConcurrentHashMap<>();

    /**
     * 注册新的生成任务
     *
     * @param appId          应用ID
     * @param taskType       任务类型
     * @param disposable     可取消的资源
     * @param sink           流式响应的sink
     * @param userId         用户ID
     * @param partialContent 部分生成内容的收集器
     */
    public void registerTask(Long appId, String taskType, Disposable disposable, FluxSink<String> sink, Long userId, StringBuilder partialContent) {
        GenerationTask task = new GenerationTask(appId, taskType, disposable, sink, userId, partialContent);
        activeTasks.put(appId, task);
        log.info("注册生成任务: appId={}, taskType={}, userId={}", appId, taskType, userId);
    }

    /**
     * 取消指定应用的生成任务
     *
     * @param appId  应用ID
     * @param userId 用户ID
     * @return 是否成功取消
     */
    public boolean cancelTask(Long appId, Long userId) {
        GenerationTask task = activeTasks.get(appId);
        if (task != null) {
            // 验证用户权限：只有正在生成的用户才能取消
            if (!task.userId.equals(userId)) {
                log.warn("用户无权限取消生成任务: appId={}, requestUserId={}, taskUserId={}", appId, userId, task.userId);
                return false;
            }
            // 从任务列表中移除
            activeTasks.remove(appId);
            try {
                // 取消流式响应
                if (task.sink != null) {
                    task.sink.complete();
                }
                // 取消可取消的资源
                if (task.disposable != null && !task.disposable.isDisposed()) {
                    task.disposable.dispose();
                }
                // 更新聊天记录状态为手动中断（状态值1）
                chatHistoryService.updateChatHistoryStatus(appId, userId, 1);

                log.info("成功取消生成任务: appId={}, taskType={}, userId={}", appId, task.taskType, userId);
                return true;
            } catch (Exception e) {
                log.error("取消生成任务时发生错误: appId={}, userId={}", appId, userId, e);
                return false;
            }
        }
        log.warn("未找到要取消的生成任务: appId={}, userId={}", appId, userId);
        return false;
    }

    /**
     * 完成任务并清理资源
     *
     * @param appId 应用ID
     */
    public void completeTask(Long appId, StringBuilder partialContent, Long userId) {
        GenerationTask task = activeTasks.remove(appId);
        //保存目前的ai返回内容
        // 保存已接收到的内容到对话历史
        savePartialContentToChatHistory(partialContent.toString(), appId, userId);
        if (task != null) {
            log.info("完成生成任务: appId={}, taskType={}, userId={}", appId, task.taskType, task.userId);
        }
    }

    /**
     * 保存部分内容到对话历史（中断时调用）
     *
     * @param partialContent 部分内容
     * @param appId          应用 ID
     * @param userId         用户 ID
     */
    private void savePartialContentToChatHistory(String partialContent, Long appId, Long userId) {
        try {
            log.info("开始保存部分内容到对话历史，appId: {}, userId: {}, 内容长度: {}", appId, userId, partialContent.length());

            // 使用 chatHistoryService.saveAIMessage 保存 AI 消息
            boolean saveResult = chatHistoryService.saveAIMessage(appId, userId, partialContent);

            if (saveResult) {
                log.info("部分内容保存到对话历史成功");
            } else {
                log.warn("部分内容保存到对话历史失败");
            }
        } catch (Exception e) {
            log.error("保存部分内容到对话历史失败: {}", e.getMessage(), e);
        }
    }

    /**
     * 检查是否有正在进行的任务
     *
     * @param appId 应用ID
     * @return 是否有正在进行的任务
     */
    public boolean hasActiveTask(Long appId) {
        return activeTasks.containsKey(appId);
    }

    /**
     * 获取正在进行的任务数量
     *
     * @return 任务数量
     */
    public int getActiveTaskCount() {
        return activeTasks.size();
    }

    /**
     * 获取任务的用户ID
     *
     * @param appId 应用ID
     * @return 用户ID，如果没有任务则返回null
     */
    public Long getTaskUserId(Long appId) {
        GenerationTask task = activeTasks.get(appId);
        return task != null ? task.userId : null;
    }

    /**
     * 生成任务信息
     */
    private static class GenerationTask {
        private final Long appId;
        private final String taskType;
        private final Disposable disposable;
        private final FluxSink<String> sink;
        private final Long userId;
        private final StringBuilder partialContent;
        private final long startTime;

        public GenerationTask(Long appId, String taskType, Disposable disposable, FluxSink<String> sink, Long userId, StringBuilder partialContent) {
            this.appId = appId;
            this.taskType = taskType;
            this.disposable = disposable;
            this.sink = sink;
            this.userId = userId;
            this.partialContent = partialContent;
            this.startTime = System.currentTimeMillis();
        }
    }
}