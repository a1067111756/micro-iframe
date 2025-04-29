# 🚀 micro-iframe

> 🔥 一个基于 iframe + postMessage 实现微前端通信交互的三方库

### 一、项目背景与设计目标
___
- 背景：随着前端业务复杂度提升，微前端架构成为大型项目的主流方案。你肯定也和我一样使用过乾坤、micro-app、wujie这些成熟的微前端三方库，但经过一段时间的使用我发现这些三方库并不是完全理想的方案，你会发现对于跨域、资源地址、三方js加载等问题总是伴随微前端三方库，并且有时很难解决。特别是当你项目中有使用Cesium这类本身就带有静态资源、Worker嵌入微前端应用后，多多少少会有问题，且很难解决。我发现iframe 作为最原生、隔离性最强的微前端实现方式，天然支持多应用独立运行、技术栈无关、样式与路由隔离是非常适合做微前端的方案，如果再打通iframe间的消息通信，那微前端的基本功能即可完成。
- 目标：提供一个简单易用、灵活可扩展的 iframe 微前端集成工具，降低主应用与子应用集成门槛，提升开发效率。
- 声明：本库专注于 iframe 微前端场景，适合需要多系统集成、渐进式迁移、独立部署的前端项目。

### 二、项目原理
___
- micro-iframe会维护一个路由表，用于记录你的应用的结构关系信息，包括子应用的名称、id、origin等
- iframe的通信是通过postMessage实现，几乎浏览器都支持，且可以跨域
- iframe和iframe通过消息进行通信，路由表会记录应用到应用间传递的路径，micro-iframe会根据路径层层转发消息，直到消息传递到目标应用

### 三、安装与快速上手
___
#### 安装
```bash
npm i micro-iframe
```

#### 主应用中
```javascript
import { MicroMainApp } from 'micro-iframe'

// 在主应用中注册路由表
// 第一个参数是主应用的名称，第二个参数是路由表(路由表是一个具有层级关系的树形结构)
window.microIframe = new MicroMainApp('MAIN_APP', {
  name: 'MAIN_APP',
  iframeId: 'main-app',
  origin: 'http://localhost:3000',
  children: [
    {
      name: 'CHILD_APP1',
      iframeId: 'child-app1',
      origin: 'http://localhost:3001',
      children: [
        {
          name: 'CHILD_APP3',
          iframeId: 'child-app3',
          origin: 'http://localhost:3003'
        }
      ]
    },
    {
      name: 'CHILD_APP2',
      iframeId: 'child-app2',
      origin: 'http://localhost:3002',
      children: [
        {
          name: 'CHILD_APP4',
          iframeId: 'child-app4',
          origin: 'http://localhost:3004'
        }
      ]
    },
  ]
})

// 监听外部传递的消息 - 写法与mitt库类似
// 第一个参数是监听事件名称，第二个参数是回调函数
window.microIframe.$on('MainAppType', (message) => {
  console.log(message)
})

// 发送消息给到子应用 - 写法与mitt库类似
// 第一个参数是发送目标应用名称，第二个参数是发送事件名称，第三个参数是发送消息内容
window.microIframe.$emit('CHILD_APP1', 'ChildApp1Type', '主应用 -> 子应用1的消息')
```

#### 子应用对接
子应用无需特殊改造，建议在 window 上监听 message 事件实现与主应用通信。
```javascript
import { MicroChildApp } from 'micro-iframe'

// 注册子应用，第一个参数是主应用的名称
window.microIframe = new MicroChildApp('CHILD_APP1')

// 监听外部传递的消息 - 写法与mitt库类似
// 第一个参数是监听事件名称，第二个参数是回调函数
window.microIframe.$on('ChildApp1Type', (message) => {
  console.log(message)
})

// 发送消息给到其它应用 - 写法与mitt库类似
// 第一个参数是发送目标应用名称，第二个参数是发送事件名称，第三个参数是发送消息内容
window.microIframe.$emit('MAIN_APP', 'MainAppType', '子应用1 -> 主应用的消息')
```

### 四、API 说明
___
#### `new MicroMainApp(microName: string, microAppRoute: MicroIFrameRouteNode)`
- 用途: 创建主应用实例，使用主应用中
- `microName`: 主应用名称，和路由表中名称对应
- `microAppRoute`: 应用路由表，是由主应用为根节点的一棵树形结构，树形结构能正确反应应用间的层级关系。其中每个节点的属性如下：
  - `name`: 应用名称
  - `iframeId`: iframe 元素的 id，用于查找iframe，请一定给iframe设置id属性
  - `origin`: iframe 元素的 origin，即你项目部署的域名端口，这是postMessage通信的必要信息
  - `children`: 该应用的下属子应用
  
#### `new MicroChildApp(microName: string)`
- 用途: 创建子应用实例，使用所有子应用中
- `microName`: 子应用名称，和路由表中名称对应

#### `$on(msgType: string, msgCallback: Function)`
- 用途: 监听消息
- `msgType`: 消息的事件类型
- `msgCallback`: 消息的回调函数，function ({ fromApp, targetApp, type, data }) {}
  - `fromApp`: 消息来自于应用的名称
  - `targetApp`: 消息目标应用的名称
  - `type`: 消息类型
  - `data`: 消息内容
  
#### `$emit(appName: string, msgType: string, msgData: any)`
- 用途: 发送消息
- `appName`: 消息目标应用的名称
- `msgType`: 消息类型
- `msgData`: 消息内容

### 五、常见问题 Q&A
___
1. **这个库到底做了些什么？有什么用？**
   - 这个库实际就是postMessage的封装，通过postMessage实现iframe应用与iframe应用间的通信，简化使用者的操作。eg: 如下的应用集成结构
```
      主应用 (http://tad.com)
      ├── 子应用1 (http://aaaa.com)
      │   └── 子应用3 (http://bbb.com)
      └── 子应用2 (http://ccc.com)
          └── 子应用4 (http://ddd.com)

      a. 子应用1和子应用2是主应用的子应用，子应用3和子应用4是子应用1的子应用。现在要实现应用与应用间
      的通信，比如子应用3发送消息给子应用4。
        1. 那就需要子应用先发送消息给子应用1
        2. 子应用1收到消息后，再发消息给主应用
        3. 主应用收到消息后，再发消息给子应用2
        4. 子应用2收到消息后，再发消息给子应用4 

      b. micro-iframe就是帮你简化这个步骤的，只需要在子应用3中调用$emit发送消息，设置targetApp
      为子应用4就可实现，使用者不需要关心消息的传递过程。
        $emit('子应用4', 'xxxx', 'xxxx')

```

1. **iframe集成有什么优劣势和其它微前端三方库？**
   - iframe的优势在于天然的隔离，集成系统时几乎不会出现太大的问题。而其它微前端三方库在集成时多多少少会出现一些问题要处理。
   - iframe的缺点在于:
     - 性能问题, iframe的性能开销相对较大
     - 渲染问题, iframe需要从头加载资源，渲染速度相对较慢，导致加载期间会有白屏现象
     - 资源共享问题，iframe的隔离是好处也是缺点，隔离导致iframe之间无法共享资源，多个应用虽然使用了相同的资源，但都需要重新加载 
     - 当然以前的问题多多少少都可以通过一些手段进行优化解决的

### 六、版本更新记录
___
- v0.0.1: 首次发布，完成应用间通信基本功能
- v0.0.2: 
  - 修复声明文件未导出问题
  - 添加日志打印开关
- v0.0.3: 
  - 优化全局对象window挂载声明问题
  ``` typescript
    declare global {
      interface Window {
        microIframe?: MicroMainApp | MicroChildApp,
        microMainIframe?: MicroMainApp
        microChildIframe?: MicroChildApp
      }
    }
  ```
---
