import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MicroChildApp } from '../../micro-iframe/src/index'

window.microIframe = new MicroChildApp('CHILD_APP1')

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  // </StrictMode>,
    <App />
)
