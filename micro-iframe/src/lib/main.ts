/* 核心相关 */
import MessageEntity from './message'
import { mittBus } from './mitt-bus'
import { flattenTreeWithKeyPath } from './helper'
import type { Handler } from 'mitt'
import type { MicroIFrameRouteNode, MicroIFrameFlatRoute, MicroIFrameOptionsType } from '../types/index.d'

export default class MicroMainApp {
  // 属性 - 微应用原树路由表
  public readonly MICRO_IFRAME_ORIGIN_ROUTES = {} as MicroIFrameRouteNode

  // 属性 - 微应用路由表
  public readonly MICRO_IFRAME_ROUTES = [] as MicroIFrameFlatRoute[]

  // 属性 - 当前应用路由信息
  public readonly MICRO_IFRAME_CUR_ROUTE = {} as MicroIFrameFlatRoute

  // 属性 - 微应用名称
  public readonly MICRO_IFRAME_NAME = '' as string

  // 属性 - 配置项
  public readonly MICRO_IFRAME_OPTIONS = {
    log: false
  } as MicroIFrameOptionsType


  // 静态属性 - 事件类型
  static MICRO_IFRAME_EVENT = {
    INIT_RESPONSE_CONFIG: `${MessageEntity.MESSAGE_TYPE_PREFIX}INIT_RESPONSE_CONFIG`,
    INIT_REQUEST_CONFIG: `${MessageEntity.MESSAGE_TYPE_PREFIX}INIT_REQUEST_CONFIG`,
  }

  // 构造函数
  constructor(microName: string, microAppRoute: MicroIFrameRouteNode, microOptions: MicroIFrameOptionsType) {
    // 赋值微应用名称
    this.MICRO_IFRAME_NAME = microName
    this.MICRO_IFRAME_OPTIONS = Object.assign({}, this.MICRO_IFRAME_OPTIONS, microOptions) as MicroIFrameOptionsType

    // 路由信息表
    const micro_iframe_routes = flattenTreeWithKeyPath(microAppRoute)

    // 找到当前路由信息
    const match = micro_iframe_routes.find(it => it.name === microName)
    if (!match) {
      throw new Error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: ${microName} 在路由表中未找到匹配项, 请检查注册应用名称和路由表是否匹配`)
    }

    // 赋值路由表
    this.MICRO_IFRAME_ORIGIN_ROUTES = microAppRoute
    this.MICRO_IFRAME_ROUTES = micro_iframe_routes
    this.MICRO_IFRAME_CUR_ROUTE = match

    console.log(`[micro-iframe] 主应用: ${this.MICRO_IFRAME_NAME}注册成功`)

    // 初始化
    this.__init()
  }

  // 方法 - 处理请求配置注册消息
  __handleIframeInitRequestConfigMessage (fromAppRoute: MicroIFrameFlatRoute) {
    const targetWindow = (document.getElementById(fromAppRoute.iframeId) as HTMLIFrameElement)?.contentWindow
    if (targetWindow) {
      const message = new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: fromAppRoute.name, type: MicroMainApp.MICRO_IFRAME_EVENT.INIT_RESPONSE_CONFIG, data: this.MICRO_IFRAME_ORIGIN_ROUTES })
      targetWindow.postMessage(message, fromAppRoute.origin)
    }
  }

  // 方法 - 转发消息
  __handleIframeForwardMessage (message: MessageEntity) {
    // 查找目标应用路由
    const targetAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === message.targetApp)
    if (!targetAppRoute) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 转发消息, 消息目标应用${message.targetApp}未在路由表中注册，发送失败`)
      return
    }

    // 转发的下一个子应用名称
    const curNodeIndex = targetAppRoute.keyPath.findIndex(it => it === this.MICRO_IFRAME_NAME)
    if (curNodeIndex === -1 || curNodeIndex + 1 >= targetAppRoute.keyPath.length) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 转发消息, 消息中间应用节点未找到，发送失败`)
      return
    }

    // 查找转发的下一个子应用路由
    const nextNodeAppName = targetAppRoute.keyPath[curNodeIndex + 1]
    const nextNodeAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === nextNodeAppName)
    if (!nextNodeAppRoute) {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 转发消息, 消息中间应用${nextNodeAppName}未在路由表中注册，发送失败`)
      return
    }

    // 转发消息
    const targetWindow = (document.getElementById(nextNodeAppRoute.iframeId || '') as HTMLIFrameElement)?.contentWindow
    if (targetWindow) {
      targetWindow.postMessage(message, nextNodeAppRoute.origin)
    } else {
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 转发消息, 消息中间应用目标窗口: ${nextNodeAppRoute.iframeId}未找到, 发送失败`)
    }
  }

  // 方法 - 检查消息是否来自有效域名(即在路由表中, 来自有效域名，来自有效App名称)
  __checkMessageIsValid (event: MessageEvent) {
    // 检查 - 消息格式是否符合，如果type不符合规则，表明不是MIC_IFRAME的消息，不进行处理
    if (!MessageEntity.isValid(event?.data || {})) {
      this.MICRO_IFRAME_OPTIONS.log && console.warn(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 接收到消息不符合micro-iframe规则, 该消息被丢弃`, event)
      return
    }

    // 检查 - 来自有效域名，来自有效App名
    const match = this.MICRO_IFRAME_ROUTES.find(it => it.name === event.data.fromApp)
    if (!match) {
      this.MICRO_IFRAME_OPTIONS.log && console.warn(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 接收到未在路由表注册消息，该消息被丢弃`, event)
      return false
    }

    return true
  }

  // 方法 - 初始化
  __init () {
    // 监听消息
    window.addEventListener('message', (event: MessageEvent) => {
      this.MICRO_IFRAME_OPTIONS.log && console.log(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用接收到消息:`, event)

      // 检查 - 消息是否有效
      if (!this.__checkMessageIsValid(event)) {
        return
      }

      // 接收到的消息
      const receivedMessage = new MessageEntity(event?.data || {})
 
      // 第一种情况 - 消息类型是握手信息，子应用请求注册配置
      if (receivedMessage.type === MicroMainApp.MICRO_IFRAME_EVENT.INIT_REQUEST_CONFIG) {
        const fromAppRoute = this.MICRO_IFRAME_ROUTES.find(it => it.name === event.data.fromApp) as any
        this.__handleIframeInitRequestConfigMessage(fromAppRoute)
        return
      }

      // 第二种情况 - 消息不是发送给当前应用的，需要当前应用转发
      if (receivedMessage.targetApp !== this.MICRO_IFRAME_NAME) {
        this.__handleIframeForwardMessage(receivedMessage)
        return
      }

      // 第三种情况 - 消息是发送给当前应用的，分发消息到事件总线
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
      this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 发送消息, 目应用${appName}在路由表中未注册, 发送失败`)
      return
    }

    // 第一种情况 - 目标应用是当前应用的子应用, 则可以直接发送
    if (this.MICRO_IFRAME_CUR_ROUTE.children.includes(appName)) {
      const message = new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: appName, type: `${MessageEntity.MESSAGE_TYPE_PREFIX}${msgType}`, data: msgData })
      const targetWindow = (document.getElementById(targetAppRoute.iframeId) as HTMLIFrameElement)?.contentWindow
  
      if (targetWindow) {
        targetWindow.postMessage(message, targetAppRoute.origin)
      } else {
        this.MICRO_IFRAME_OPTIONS.log && console.error(`[micro-iframe]-[${this.MICRO_IFRAME_NAME}]应用: 发送消息, 目标应用${appName}的窗口${targetAppRoute.iframeId}未找到, 发送失败`)
      }

      return
    }

    // 第二种情况 - 目标应用不是当前应用的子应用，由下一应用转发
    this.__handleIframeForwardMessage(new MessageEntity({ fromApp: this.MICRO_IFRAME_NAME, targetApp: appName, type: `${MessageEntity.MESSAGE_TYPE_PREFIX}${msgType}`, data: msgData }))
  }
}


