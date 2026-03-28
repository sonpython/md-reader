import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('md-reader-theme') || 'dark'
// Remove any existing theme class and add the correct one
document.documentElement.classList.remove('dark', 'light')
document.documentElement.classList.add(savedTheme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
