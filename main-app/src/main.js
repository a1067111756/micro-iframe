import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { MicroMainApp } from '../../micro-iframe/src/index'
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


createApp(App).mount('#app')
