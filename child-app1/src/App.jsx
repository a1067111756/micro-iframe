import './App.css'
import { useEffect } from 'react'
import reactLogo from './assets/react.svg'

function App() {
  // 属性 - 应用3
  const childApp3Src = 'http://localhost:3003/'

  // 生命周期 - 挂载
  useEffect(() => {
    window.microIframe.$on('ChildApp1Type', (message) => {
      console.log(message)
    })
    return () => {}
  }, [])

  // 方法 - 向主应用发送消息
  const sendMsgToMainApp = () => {
    window.microIframe.$emit('MAIN_APP', 'MainAppType', { c: '子应用1 -> 主应用的消息' })
  }

  // 方法 - 向子应用2发送消息
  const sendMsgToChildApp2 = () => {
    window.microIframe.$emit('CHILD_APP2', 'ChildApp2Type', '子应用1 -> 子应用2的消息')
  }

   // 方法 - 向子应用3发送消息
   const sendMsgToChildApp3 = () => {
    window.microIframe.$emit('CHILD_APP3', 'ChildApp3Type', '子应用1 -> 子应用3的消息')
  }
  
  // 方法 - 向子应用4发送消息
  const sendMsgToChildApp4 = () => {
    window.microIframe.$emit('CHILD_APP4', 'ChildApp4Type', '子应用1 -> 子应用4的消息')
  }  

  return (
    <>
      <div style={{ width: '100%', height: '100%', border: '1px dashed #000', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={reactLogo} className="logo react" alt="React logo" />
          <span>子应用1-react</span>

          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', columnGap: '10px' }}>
            <button onClick={sendMsgToMainApp}>向主应用发送消息</button>
            <button onClick={sendMsgToChildApp2}>向子应用2发送消息</button>
            <button onClick={sendMsgToChildApp3}>向子应用3发送消息</button>
            <button onClick={sendMsgToChildApp4}>向子应用4发送消息</button>
          </div>
        </div>

        {/* 子应用3 */}
        <iframe id="child-app3" src={childApp3Src} style={{ width: '100%', height: '100%',  border: 'none', padding: '10px', marginTop: '10px' }} />
      </div>
    </>
  )
}

export default App
