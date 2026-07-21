import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'
import { initLocalStorage } from './utils/localStorage'

// Initialize localStorage with sample data (safe with try-catch)
console.log('🚀 App starting...')
setTimeout(() => {
  try {
    console.log('📦 Initializing localStorage...')
    initLocalStorage()
    console.log('✅ localStorage initialized')
  } catch (error) {
    console.error('⚠️ localStorage initialization error:', error)
  }
}, 100)

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
