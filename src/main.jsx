import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'
import { LoadScript } from '@react-google-maps/api'
import { initLocalStorage } from './utils/localStorage'

import { seedDatabase } from './firebase/seedData'

// Initialize localStorage cleanup
initLocalStorage()

createRoot(document.getElementById('root')).render(
  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
    <AppProvider>
      <App />
    </AppProvider>
  </LoadScript>,
)
seedDatabase()
