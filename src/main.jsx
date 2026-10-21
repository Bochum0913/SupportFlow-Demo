import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installDemoApi } from './demoApi.js'

if (import.meta.env.VITE_DEMO_MODE === 'true') installDemoApi()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
