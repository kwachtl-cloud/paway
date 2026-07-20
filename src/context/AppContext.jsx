import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { translations } from '../data/translations'
import { auth } from '../firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { initializeBackButtonHandler, removeBackButtonHandler } from '../utils/backButton'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home')
  const [currentScreen, setCurrentScreen] = useState('home')
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(null)
  const [selectedProviderId, setSelectedProviderId] = useState(null)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [selectedPetId, setSelectedPetId] = useState(null)
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
        })
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  // Initialize Android back button handler
  useEffect(() => {
    initializeBackButtonHandler(goBack)
    return () => removeBackButtonHandler()
  }, [goBack])

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || key
    },
    [lang]
  )

  const navigate = useCallback((screen, options) => {
    console.log('Navigating to:', screen, 'with options:', options)
    setCurrentScreen(screen)
    if (options?.providerId) setSelectedProviderId(options.providerId)
    if (options?.bookingId) setSelectedBookingId(options.bookingId)
    if (options?.petId) setSelectedPetId(options.petId)
    if (options?.conversationId) setSelectedConversationId(options.conversationId)
    if (options?.alertId) setSelectedAlertId(options.alertId)
  }, [])

  const goBack = useCallback(() => {
    setSelectedProviderId(null)
    setSelectedBookingId(null)
    setSelectedPetId(null)
    setSelectedConversationId(null)
    setSelectedAlertId(null)
    setCurrentScreen(activeTab)
  }, [activeTab])

  const value = useMemo(() => ({
    activeTab,
    setActiveTab,
    currentScreen,
    setCurrentScreen,
    lang,
    setLang,
    t,
    navigate,
    goBack,
    user,
    setUser,
    selectedProviderId,
    setSelectedProviderId,
    selectedBookingId,
    setSelectedBookingId,
    selectedPetId,
    setSelectedPetId,
    selectedConversationId,
    setSelectedConversationId,
    selectedAlertId,
    setSelectedAlertId,
  }), [activeTab, currentScreen, lang, t, navigate, goBack, user, selectedProviderId, selectedBookingId, selectedPetId, selectedConversationId, selectedAlertId])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
