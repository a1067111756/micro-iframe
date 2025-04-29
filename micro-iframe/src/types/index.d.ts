// 路由节点类型
export interface MicroIFrameRouteNode {
  name: string
  iframeId: string
  origin: string
  children?: MicroIFrameRouteNode[]
}

// 扁平化后的路由类型
export interface MicroIFrameFlatRoute extends Omit<MicroIFrameRouteNode, 'children'> {
  keyPath: string[],
  children: string[]
}

// 消息实体载荷类型
export interface MicroIFrameMessageParamType {
  fromApp: string
  targetApp: string
  type: string
  data: any
}

// 
export interface MicroIFrameOptionsType {
  // 是否开启打印
  log?: boolean
}

// mitt 事件处理类型
export type Handler = (event?: any) => void

// 主应用类
export declare class MicroMainApp {
  /** 微应用原树路由表 */
  public readonly MICRO_IFRAME_ORIGIN_ROUTES: MicroIFrameRouteNode
  /** 微应用路由表 */
  public readonly MICRO_IFRAME_ROUTES: MicroIFrameFlatRoute[]
  /** 当前应用路由信息 */
  public readonly MICRO_IFRAME_CUR_ROUTE: MicroIFrameFlatRoute
  /** 当前应用名称 */
  public readonly MICRO_IFRAME_NAME: string

  // 构造函数
  constructor(microName: string, microAppRoute: MicroIFrameRouteNode, microOptions?: MicroIFrameOptionsType)
  // 监听消息
  $on(msgType: string, msgCallback: Handler): void
  // 发送消息
  $emit(appName: string, msgType: string, msgData: any): void
}

// 子应用类
export declare class MicroChildApp {
  /** 微应用原路由表 */
  public readonly MICRO_IFRAME_ORIGIN_ROUTES: MicroIFrameRouteNode
  /** 微应用路由表 */
  public readonly MICRO_IFRAME_ROUTES: MicroIFrameFlatRoute[]
  /** 当前应用路由信息 */
  public readonly MICRO_IFRAME_CUR_ROUTE: MicroIFrameFlatRoute
  /** 当前应用名称 */
  public readonly MICRO_IFRAME_NAME: string
  /** 是否在MicroIFrame中 */
  public readonly POWERED_BY_MICRO_IFRAME: boolean

  // 构造函数
  constructor(microName: string, microOptions?: MicroIFrameOptionsType)
  // 监听消息
  $on(msgType: string, msgCallback: Handler): void
  // 发送消息
  $emit(appName: string, msgType: string, msgData: any): void
}

declare global {
  interface Window {
    microIframe?: MicroMainApp | MicroChildApp,
    microMainIframe?: MicroMainApp
    microChildIframe?: MicroChildApp
  }
}