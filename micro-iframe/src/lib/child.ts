/* 核心相关 */
import MessageEntity from './message'
import { mittBus } from './mitt-bus'
import { flattenTreeWithKeyPath } from './helper'
import type { Handler } from 'mitt'
import type { MicroIFrameRouteNode, MicroIFrameFlatRoute, MicroIFrameOptionsType } from '../types/index.d'


export default class MicroChildApp {
  // 属性 - 微应用原路由表
  public MICRO_IFRAME_ORIGIN_ROUTES = {} as MicroIFrameRouteNode

  // 属性 - 微应用路由表
  public MICRO_IFRAME_ROUTES = [] as MicroIFrameFlatRoute[]

  // 属性 - 当前应用路由信息
  public MICRO_IFRAME_CUR_ROUTE = {} as MicroIFrameFlatRoute

  // 属性 - 是否握手成功
  private MICRO_IFRAME_IS_HANDSHAKE = false

  // 属性 - 微应用名称
  public MICRO_IFRAME_NAME = ''

  // 属性 - 是否在MicroIFrame中
  public POWERED_BY_MICRO_IFRAME = false

  // 属性 - 配置项
  public MICRO_IFRAME_OPTIONS = {
    log: false
  } as MicroIFrameOptionsType

  // 静态属性 - 事件类型
  static MICRO_IFRAME_EVENT = {
    INIT_RESPONSE_CONFIG: `${MessageEntity.MESSAGE_TYPE_PREFIX}INIT_RESPONSE_CONFIG`,
    INIT_REQUEST_CONFIG: `${MessageEntity.MESSAGE_TYPE_PREFIX}INIT_REQUEST_CONFIG`,
  }
  
  // 构造函数
  constructor(microName: string, microOptions: MicroIFrameOptionsType) {
    this.__init(microName, microOptions)
  }

  // 方法 - 处理响应配置注册消息, 只允许握手一次，应用注册成功
  __handleIframeInitResponseConfigMessage (message: MessageEntity) {
    // 检查 - 是否已经注册过
    if (this.MICRO_IFRAME_IS_HANDSHAKE) {
      return
    }

    // 路由信息表
    const micro_iframe_routes = flattenTreeWithKeyPath(message.data)

    // 找到当前路由信息
    const match = micro_iframe_routes.find(it => it.name === this.MICRO_IFRAME_NAME)
    if (!match) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: ${this.MICRO_IFRAME_NAME} 在路由表中未找到匹配项, 请检查注册应用名称和路由表是否匹配`)
      return
    }

    // 赋值路由表
    this.MICRO_IFRAME_ORIGIN_ROUTES = message.data
    this.MICRO_IFRAME_ROUTES = micro_iframe_routes
    this.MICRO_IFRAME_CUR_ROUTE = match

    // 完成握手
    this.POWERED_BY_MICRO_IFRAME = true
    this.MICRO_IFRAME_IS_HANDSHAKE = true
    console.log(`[micro-iframe] 子应用: ${this.MICRO_IFRAME_NAME}注册成功`)
  }

  // 方法 - 处理请求配置注册消息
  __handleIframeInitRequestConfigMessage (fromAppRoute: MicroIFrameFlatRoute) {
    const targetWindow = (document.getElementById(fromAppRoute.iframeId) as HTMLIFrameElement)?.contentWindow
    if (targetWindow) {
      const message = new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: fromAppRoute.name, type: MicroChildApp.MICRO_IFRAME_EVENT.INIT_RESPONSE_CONFIG, data: this.MICRO_IFRAME_ORIGIN_ROUTES })
      targetWindow.postMessage(message, fromAppRoute.origin)
    }
  }
 
  // 方法 - 转发消息
  __handleIframeForwardMessage (message: MessageEntity) {
    // 查找目标应用路由
    const targetAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === message.targetApp)
    if (!targetAppRoute) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 转发消息, 消息目标应用${message.targetApp}未在路由表中注册，发送失败`)
      return
    }

    // 1. keypath包含当前应用，表示目标应用是当前应用的下属节点，消息往下转发
    if (targetAppRoute.keyPath.includes(this.MICRO_IFRAME_NAME)) {
      // 转发的下一个子应用名称
      const curNodeIndex = targetAppRoute.keyPath.findIndex(it => it === this.MICRO_IFRAME_NAME)
      if (curNodeIndex === -1 || curNodeIndex + 1 >= targetAppRoute.keyPath.length) {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 转发消息, 消息中间应用节点未找到，发送失败`)
        return
      }

      // 查找转发的下一个子应用路由
      const nextNodeAppName = targetAppRoute.keyPath[curNodeIndex + 1]
      const nextNodeAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === nextNodeAppName)
      if (!nextNodeAppRoute) {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 发送消息, 消息中间应用${nextNodeAppName}未在路由表中注册, 发送失败`)
        return
      }

      // 转发消息
      const targetWindow = (document.getElementById(nextNodeAppRoute.iframeId) as HTMLIFrameElement)?.contentWindow
      if (targetWindow) {
        targetWindow.postMessage(message, nextNodeAppRoute.origin)
      } else {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 发送消息, 目标应用${nextNodeAppName}的窗口${targetAppRoute.iframeId}未找到, 发送失败`)
      }

    // 2. 不包含，消息往上转发，直接到主应用转发
    } else {
      const targetWindowRes = this.__getTargetWindowFromKeyPath(targetAppRoute)

      if (targetWindowRes?.window) {
        targetWindowRes?.window?.postMessage(message, targetWindowRes.hitMainApp ? this.MICRO_IFRAME_ORIGIN_ROUTES.origin : targetAppRoute.origin)
      } else {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 发送消息, 目标应用${targetAppRoute}的窗口${targetAppRoute.iframeId}未找到, 发送失败`)
      }
    }
  }

  // 方法 - 从keyPath中获取正确targetWindow
  // keypath记录了从主应用到当前应用的路径，反向向上溯源，可以找到目标应用window
  // 如果没有则将消息传递到主应用，由主应用转发
  __getTargetWindowFromKeyPath (matchApp: MicroIFrameFlatRoute) {
    // 目标window
    let targetWindow = null as any
    // 是否是主应用
    let hitMainApp = false
    // keyPath
    const keyPath = Object.assign(this.MICRO_IFRAME_CUR_ROUTE.keyPath)

    // 反向遍历
    for (let i = keyPath.length - 1; i >= 0; i--) {
      // 当前值为当前应用 -> 跳过
      if (keyPath[i] === this.MICRO_IFRAME_NAME) {
        targetWindow = window
        continue
      }

      // 当前值为当主应用 -> 跳过
      if (keyPath[i] === this.MICRO_IFRAME_ORIGIN_ROUTES.name) {
        targetWindow = targetWindow?.parent
        hitMainApp = true
        break
      }

      // 当前值为目标应用 -> 命中window
      if (keyPath[i] === matchApp.name) {
        targetWindow = targetWindow?.parent
        break
      }

      // 当前值为中间应用 -> 继续朝上遍历
      targetWindow = targetWindow?.parent
    }

    return {
      window: targetWindow,
      hitMainApp: hitMainApp
    }
  }

  // 方法 - 初始化
  __init (microName: string, microOptions: MicroIFrameOptionsType) {
    // 赋值微应用名称
    this.MICRO_IFRAME_NAME = microName
    this.MICRO_IFRAME_OPTIONS = Object.assign({}, this.MICRO_IFRAME_OPTIONS, microOptions) as MicroIFrameOptionsType

    // 发送消息到主应用，获取配置
    const HandShakeMessage = new MessageEntity({ fromApp: '', targetApp: '', type: MicroChildApp.MICRO_IFRAME_EVENT.INIT_REQUEST_CONFIG, data: undefined })
    window?.parent.postMessage(HandShakeMessage, '*')

    // 添加消息监听
    window.addEventListener('message', (event) => {
      // 接收到的消息
      const receivedMessage = new MessageEntity(event?.data || {})

      // 如果type不符合规则，表明不是MIC_IFRAME的消息，不进行处理
      if (!MessageEntity.isValid(receivedMessage)) {
        this.MICRO_IFRAME_OPTIONS.log && console.warn(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 接收到消息不符合micro-iframe规则, 该消息被丢弃`)
        this.MICRO_IFRAME_OPTIONS.log && console.warn(event)
        return
      }

      // 第一种情况 - 消息类型是握手信息，父应用返回的注册配置消息，
      if (receivedMessage.type === MicroChildApp.MICRO_IFRAME_EVENT.INIT_RESPONSE_CONFIG) {
        this.__handleIframeInitResponseConfigMessage(receivedMessage)
        return
      }

      // 检查 - 消息是否来自有效域名(即在路由表中)
      const fromAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.origin === event.origin)
      if (!fromAppRoute) {
        this.MICRO_IFRAME_OPTIONS.log && console.warn(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 接收到未在路由表注册域名消息，该消息被丢弃`)
        this.MICRO_IFRAME_OPTIONS.log && console.warn(event)
        return
      }

      // 第二种情况 - 消息类型是握手信息，子应用请求注册配置
      if (receivedMessage.type === MicroChildApp.MICRO_IFRAME_EVENT.INIT_REQUEST_CONFIG) {
        this.__handleIframeInitRequestConfigMessage(fromAppRoute)
        return
      }

      // 第三种情况 - 消息不是发送给当前应用的，需要当前应用转发
      if (receivedMessage.targetApp !== this.MICRO_IFRAME_NAME) {
        this.__handleIframeForwardMessage(receivedMessage)
        return
      }

      // 第四种情况 - 消息是发送给当前应用的，分发消息到事件总线
      mittBus.emit(MessageEntity.getRealMessageType(receivedMessage.type), MessageEntity.getRealMessage(receivedMessage))
    })
  }

  // 方法 - 接收消息
  $on (msgType: string, msgCallback: Handler): void {
    mittBus.on(msgType, msgCallback)
  }

  // 方法 - 发送消息
  $emit (appName: string, msgType: string, msgData: any): void {
    // 检查 - 消息发送地址APP是否有效(即在路由表中)
    const targetAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === appName)
    if (!targetAppRoute) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 发送消息, 目应用${appName}在路由表中未注册, 发送失败`)
      return
    }

    // 第一种情况 - 目标应用是当前应用的子应用, 则可以直接发送
    if (this.MICRO_IFRAME_CUR_ROUTE.children.includes(appName)) {
      const message = new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: appName, type: `${MessageEntity.MESSAGE_TYPE_PREFIX}${msgType}`, data: msgData })
      const targetWindow = (document.getElementById(targetAppRoute.iframeId) as HTMLIFrameElement)?.contentWindow

      if (targetWindow) {
        targetWindow.postMessage(message, targetAppRoute.origin)
      } else {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe] ${this.MICRO_IFRAME_NAME}应用: 发送消息, 目标应用${appName}的窗口${targetAppRoute.iframeId}未找到, 发送失败`)
      }

      return
    }

    // 第二种情况 - 目标应用不是当前应用的子应用，由下一应用转发
    this.__handleIframeForwardMessage(new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: appName, type: `${MessageEntity.MESSAGE_TYPE_PREFIX}${msgType}`, data: msgData }))
  }
}


