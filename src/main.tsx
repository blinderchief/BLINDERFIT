import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simple React 18 rendering without StrictMode to avoid double component mounting
// which can trigger duplicate animations and loading states
const root = document.getElementById('root')

if (root) {
  ReactDOM.createRoot(root).render(<App />)
} else {
  console.error("Root element with id 'root' not found. Check your index.html file.")
}



