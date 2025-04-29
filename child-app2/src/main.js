import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { MicroChildApp } from '../../micro-iframe/src/index'

window.microIframe = new MicroChildApp('CHILD_APP2')

createApp(App).mount('#app')
