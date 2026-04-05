import { API_BASE_URL, WS_BASE_URL } from '@/constants';

export default class AppEditWebSocket {
    private appId: string
    private socket: WebSocket | null
    private eventHandlers

    constructor(appId: string) {
        this.appId = appId
        this.socket = null
        this.eventHandlers = {}
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const runtimeWsBaseUrl = WS_BASE_URL || `${protocol}//${window.location.host}`;
        const wsUrl = `${runtimeWsBaseUrl}/ws/app/edit?appId=${this.appId}`;

        this.socket = new WebSocket(wsUrl)

        this.socket.binaryType = 'blob'

        this.socket.onopen = () => {
            this.triggerEvent('open')
        }

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            const type = message.type
            this.triggerEvent(type, message)
        }

        this.socket.onclose = (event) => {
            this.triggerEvent('close', event)
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket 发生错误:', error)
            this.triggerEvent('error', error)
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close()
        }
    }

    isActive() {
        return this.socket?.readyState === WebSocket.OPEN
    }

    sendMessage(message: object) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        } else {
            console.error('WebSocket 未连接，无法发送消息:', message)
        }
    }

    on(type: string, handler: (data?) => void) {
        if (!this.eventHandlers[type]) {
            this.eventHandlers[type] = []
        }
        this.eventHandlers[type].push(handler)
    }

    triggerEvent(type: string, data?) {
        const handlers = this.eventHandlers[type]
        if (handlers) {
            handlers.forEach((handler) => handler(data))
        }
    }
}
