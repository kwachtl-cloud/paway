import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home')
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [user, setUser] = useState(null)

  const navigate = useCallback((screen) => {
    console.log('Navigating to:', screen)
    setCurrentScreen(screen)
    
    // Update active tab if navigating to main screens
    const tabScreens = {
      'home': 'home',
      'sos': 'sos',
      'park-radar': 'park-radar',
      'pet-passport': 'pet-passport',
      'profile': 'profile'
    }
    
    if (tabScreens[screen]) {
      setActiveTab(tabScreens[screen])
    }
  }, [])

  const goBack = useCallback(() => {
    console.log('Going back')
    navigate('home')
  }, [navigate])

  const value = {
    activeTab,
    currentScreen,
    user,
    setUser,
    navigate,
    goBack,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
