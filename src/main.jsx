import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './appearance.css'
import './typography.css'
import './interface.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
