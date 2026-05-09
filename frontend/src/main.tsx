import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el contenedor raíz para React.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
