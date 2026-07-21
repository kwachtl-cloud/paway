import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'
import { initLocalStorage } from './utils/localStorage'

// Initialize localStorage with sample data
console.log('🚀 Initializing app...')
try {
  initLocalStorage()
  console.log('✅ localStorage initialized')
} catch (error) {
  console.error('⚠️ localStorage initialization error:', error)
}

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
