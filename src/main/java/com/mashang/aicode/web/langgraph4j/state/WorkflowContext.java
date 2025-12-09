package com.mashang.aicode.web.langgraph4j.state;

import com.mashang.aicode.web.ai.model.enums.CodeGenTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bsc.langgraph4j.prebuilt.MessagesState;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/***
 * 工作流上下文对象-就是工作流每个节点和边都可以共享的数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowContext implements Serializable {


    public static final String WORKFLOW_CONTEXT_KEY = "workflowContext";

    //当前步骤的名称
    private String currentStep;

    //原始提示词
    private String originalPrompt;

    //获取到的图片json字符串
    private String imageListStr;

    //获取到的图片列表
    private List<ImageResource> imageList;

    //ai改写后的提示词
    private String enhancedPrompt;

    //代码生成类型
    private CodeGenTypeEnum generationType;

    //代码文件生成路径
    private String generatedCodeDir;

    //构造返回结果路径
    private String buildResultDir;

    //失败消息
    private String errorMessage;

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 更具工作流消息状态获取上下文
     *
     * @param state
     * @return
     */
    public static WorkflowContext getContext(MessagesState<String> state) {
        return (WorkflowContext) state.data().get(WORKFLOW_CONTEXT_KEY);
    }

    /**
     * 根据工作流上下文获取消息状态
     *
     * @param context
     * @return
     */
    public static Map<String, Object> saveContext(WorkflowContext context) {
        return Map.of(WORKFLOW_CONTEXT_KEY, context);
    }
}


