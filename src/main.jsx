import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'
import { initLocalStorage } from './utils/localStorage'

// Initialize localStorage cleanup
try {
  initLocalStorage()
} catch (error) {
  console.error('Initialization error:', error)
}

// Seed database in background (delayed, don't block render)
setTimeout(() => {
  try {
    import('./firebase/seedData').then(({ seedDatabase }) => {
      seedDatabase().catch(err => console.warn('Seed database failed:', err))
    })
  } catch (error) {
    console.warn('Could not load seed data:', error)
  }
}, 2000)

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>,
)
