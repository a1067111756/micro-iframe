/* 消息体相关 */
import type { MicroIFrameMessageParamType } from '../types/index.d'

export default class MessageEntity {
  // 属性 - 消息来源应用
  public fromApp: string;

  // 属性 - 消息目标应用
  public targetApp: string;

  // 属性 - 消息类型
  public type: string;

  // 属性 - 消息数据
  public data: any; 

  // 静态属性 - 消息类型前缀
  static MESSAGE_TYPE_PREFIX = 'MICRO_IFRAME_'

  // 构造函数
  constructor({ fromApp, targetApp, type, data }: MicroIFrameMessageParamType) {
    this.fromApp = fromApp
    this.targetApp = targetApp
    this.type = type
    this.data = data
  }

  // 方法 - 校验对象是否是合法的消息实体
  static isValid(obj: any): boolean {
    return (
      obj &&
        typeof obj === 'object' &&
        typeof obj.fromApp === 'string' &&
        typeof obj.targetApp === 'string' &&
        typeof obj.type === 'string' &&
        'data' in obj &&
        obj.type &&
        obj.type.startsWith(MessageEntity.MESSAGE_TYPE_PREFIX)
    )
  }

  // 方法 - 从消息体中剥离类型前缀
  static getRealMessage(message: MessageEntity): MessageEntity {
    message.type = message.type.replace(MessageEntity.MESSAGE_TYPE_PREFIX, '')
    return message
  }

  // 方法 - 从消息类型中剥离类型前缀
  static getRealMessageType(messageType: string): string {
    return messageType.replace(MessageEntity.MESSAGE_TYPE_PREFIX, '')
  }
}