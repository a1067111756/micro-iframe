import './App.css'
import { useEffect } from 'react'
import reactLogo from './assets/react.svg'

function App() {
  // 生命周期 - 挂载
  useEffect(() => {
    window.microIframe.$on('ChildApp4Type', (message) => {
      console.log(message)
    })
    return () => {}
  }, [])

  // 方法 - 向主应用发送消息
  const sendMsgToMainApp = () => {
    window.microIframe.$emit('MAIN_APP', 'MainAppType', { c: '子应用4 -> 主应用的消息' })
  }

  // 方法 - 向子应用1发送消息
  const sendMsgToChildApp1 = () => {
    window.microIframe.$emit('CHILD_APP1', 'ChildApp1Type', '子应用4 -> 子应用1的消息')
  }

  // 方法 - 向子应用2发送消息
  const sendMsgToChildApp2 = () => {
    window.microIframe.$emit('CHILD_APP2', 'ChildApp2Type', '子应用4 -> 子应用2的消息')
  }

  // 方法 - 向子应用3发送消息
  const sendMsgToChildApp3 = () => {
    window.microIframe.$emit('CHILD_APP3', 'ChildApp3Type', '子应用4 -> 子应用3的消息')
  }

  return (
    <>
      <div style={{ width: '100%', height: '100%', border: '1px dashed #000', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={reactLogo} className="logo react" alt="React logo" />
          <span>子应用4-react</span>

          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', columnGap: '10px' }}>
            <button onClick={sendMsgToMainApp}>向主应用发送消息</button>
            <button onClick={sendMsgToChildApp1}>向子应用1发送消息</button>
            <button onClick={sendMsgToChildApp2}>向子应用2发送消息</button>
            <button onClick={sendMsgToChildApp3}>向子应用3发送消息</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
