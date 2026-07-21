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

// Seed Firebase database in background (delayed, don't block render)
setTimeout(() => {
  try {
    console.log('🌱 Starting Firebase seed...')
    import('./firebase/seedData').then(({ seedDatabase }) => {
      seedDatabase()
        .then(() => console.log('✅ Firebase seed complete'))
        .catch(err => console.warn('⚠️ Firebase seed failed:', err))
    }).catch(err => {
      console.warn('⚠️ Could not load seed data:', err)
    })
  } catch (error) {
    console.warn('⚠️ Seed setup error:', error)
  }
}, 3000) // Wait 3s before seeding Firebase

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
