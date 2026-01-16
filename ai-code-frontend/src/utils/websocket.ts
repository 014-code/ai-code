export default class AppEditWebSocket {
  private appId: string
  private socket: WebSocket | null
  private eventHandlers: any

  constructor(appId: string) {
    this.appId = appId
    this.socket = null
    this.eventHandlers = {}
  }

  connect() {
    const isDev = import.meta.env.MODE === 'development';
    let wsUrl: string;

    if (isDev) {
      wsUrl = `ws://localhost:8123/api/ws/app/edit?appId=${this.appId}`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/api/ws/app/edit?appId=${this.appId}`;
    }

    this.socket = new WebSocket(wsUrl)

    this.socket.binaryType = 'blob'

    this.socket.onopen = () => {
      console.log('WebSocket 连接已建立')
      this.triggerEvent('open')
    }

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('收到消息:', message)

      const type = message.type
      this.triggerEvent(type, message)
    }

    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已关闭:', event)
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
      console.log('WebSocket 连接已手动关闭')
    }
  }

  isActive() {
    return this.socket?.readyState === WebSocket.OPEN
  }

  sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
      console.log('消息已发送:', message)
    } else {
      console.error('WebSocket 未连接，无法发送消息:', message)
    }
  }

  on(type: string, handler: (data?: any) => void) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    this.eventHandlers[type].push(handler)
  }

  triggerEvent(type: string, data?: any) {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      handlers.forEach((handler: any) => handler(data))
    }
  }
}
