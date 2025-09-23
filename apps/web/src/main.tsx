import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './components/core'
import { StrictMode } from 'react'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(<StrictMode><App /></StrictMode>)
