import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'
import { LoadScript } from '@react-google-maps/api'
import { initLocalStorage } from './utils/localStorage'
import { seedDatabase } from './firebase/seedData'

// Initialize localStorage cleanup
try {
  initLocalStorage()
  // Seed database in background (don't block render)
  setTimeout(() => {
    seedDatabase().catch(err => console.warn('Seed database failed:', err))
  }, 1000)
} catch (error) {
  console.error('Initialization error:', error)
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

createRoot(document.getElementById('root')).render(
  <LoadScript 
    googleMapsApiKey={MAPS_API_KEY}
    loadingElement={<div>Loading Maps...</div>}
  >
    <AppProvider>
      <App />
    </AppProvider>
  </LoadScript>,
)
