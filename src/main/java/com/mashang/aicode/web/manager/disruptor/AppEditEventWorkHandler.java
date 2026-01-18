package com.mashang.aicode.web.manager.disruptor;

import cn.hutool.json.JSONUtil;
import com.lmax.disruptor.WorkHandler;
import com.mashang.aicode.web.manager.websocket.AppEditHandler;
import com.mashang.aicode.web.manager.websocket.model.enums.DialogueMessageTypeEnum;
import com.mashang.aicode.web.manager.websocket.model.DialogueRequestMessage;
import com.mashang.aicode.web.manager.websocket.model.DialogueResponseMessage;
import com.mashang.aicode.web.model.entity.User;
import com.mashang.aicode.web.service.UserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Component
public class AppEditEventWorkHandler implements WorkHandler<AppEditEvent> {

    @Resource
    @Lazy
    private AppEditHandler appEditHandler;

    @Resource
    private UserService userService;

    /**
     * websocket编辑处理器-消费事件
     * @param event
     * @throws Exception
     */
    @Override
    public void onEvent(AppEditEvent event) throws Exception {
        DialogueRequestMessage appEditRequestMessage = event.getPictureEditRequestMessage();
        WebSocketSession session = event.getSession();
        User user = event.getUser();
        Long appId = event.getAppId();
        // 获取到消息类别
        String type = appEditRequestMessage.getType();
        DialogueMessageTypeEnum appEditMessageTypeEnum = DialogueMessageTypeEnum.getEnumByValue(type);
        //设置应用编辑上下文
        AppEditHandler.AppEditContext appEditContext = new AppEditHandler.AppEditContext(appEditRequestMessage, session, user, appId);
        // 调用对应的消息处理方法
        switch (appEditMessageTypeEnum) {
            //进入编辑
            case ENTER_EDIT:
                appEditHandler.handleEnterEditMessage(appEditContext);
                break;
            //编辑操作
            case EDIT_ACTION:
                appEditHandler.handleEditActionMessage(appEditContext);
                break;
            //退出编辑
            case EXIT_EDIT:
                appEditHandler.handleExitEditMessage(appEditContext);
                break;
            //发送消息
            case SEND_MESSAGE:
                appEditHandler.handleSendMessage(appEditContext);
                break;
            //触摸元素
            case HOVER_ELEMENT:
                appEditHandler.handleHoverElement(appEditContext);
                break;
            //选择元素
            case SELECT_ELEMENT:
                appEditHandler.handleSelectElement(appEditContext);
                break;
            //清除元素
            case CLEAR_ELEMENT:
                appEditHandler.handleClearElement(appEditContext);
                break;
            //部署项目
            case DEPLOY_PROJECT:
                appEditHandler.handleDeployProject(appEditContext);
                break;
            //停止回复
            case STOP_RESPONSE:
                appEditHandler.handleStopResponse(appEditContext);
                break;
            //错误处理
            default:
                DialogueResponseMessage appEditResponseMessage = new DialogueResponseMessage();
                appEditResponseMessage.setType(DialogueMessageTypeEnum.ERROR.getValue());
                appEditResponseMessage.setMessage("消息类型错误");
                appEditResponseMessage.setUser(userService.getUserVO(user));
                session.sendMessage(new TextMessage(JSONUtil.toJsonStr(appEditResponseMessage)));
        }
    }

}
