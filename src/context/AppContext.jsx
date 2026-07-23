import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { translations } from '../data/translations'
import { initializeBackButtonHandler, removeBackButtonHandler } from '../utils/backButton'
import { initializePushNotifications, setupPushNotificationListeners, removePushNotificationListeners } from '../utils/pushNotifications'
import { updateUserFCMToken, updateUserLocation } from '../firebase/services'
import { getCurrentPosition } from '../utils/geolocation'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home')
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(null)
  const [selectedProviderId, setSelectedProviderId] = useState(null)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [selectedPetId, setSelectedPetId] = useState(null)
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [selectedAlertId, setSelectedAlertId] = useState(null)

  // Firebase Auth listener (with safe error handling)
  useEffect(() => {
    let unsubscribe = () => {}
    
    try {
      // Lazy load Firebase auth to avoid blocking app startup
      import('../firebase/firebase').then(({ auth }) => {
        import('firebase/auth').then(({ onAuthStateChanged, getRedirectResult }) => {
          // Check for redirect result first (mobile Google Sign-In)
          getRedirectResult(auth).then((result) => {
            if (result?.user) {
              console.log('🔄 Google redirect sign-in successful:', result.user.uid)
              // User profile will be created by loginWithGoogle if needed
            }
          }).catch((error) => {
            if (error.code !== 'auth/popup-closed-by-user') {
              console.warn('⚠️ Redirect result error:', error)
            }
          })
          
          unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
              console.log('🔑 Firebase user authenticated:', firebaseUser.uid)
              setUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'User',
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL || null
              })
              // If on welcome screen, navigate to home
              if (currentScreen === 'welcome') {
                console.log('✅ User logged in, navigating to home')
                setCurrentScreen('home')
                setActiveTab('home')
              }
            } else {
              console.log('🔑 No Firebase user, redirecting to welcome')
              setUser(null)
              // Navigate to welcome screen on logout
              setCurrentScreen('welcome')
              setActiveTab('home')
            }
          })
        }).catch(err => {
          console.warn('⚠️ Firebase auth import failed:', err)
        })
      }).catch(err => {
        console.warn('⚠️ Firebase import failed:', err)
      })
    } catch (error) {
      console.warn('⚠️ Firebase auth setup failed:', error)
    }
    
    return () => unsubscribe()
  }, [currentScreen])

  const t = useCallback(
    (key) => {
      return translations[lang]?.[key] || key
    },
    [lang]
  )

  const navigate = useCallback((screen, options) => {
    console.log('Navigating to:', screen, 'with options:', options)
    setCurrentScreen(screen)
    
    // Update activeTab if navigating to a main tab screen
    const mainTabs = ['home', 'park-radar', 'pet-passport', 'profile']
    if (mainTabs.includes(screen)) {
      setActiveTab(screen)
    }
    
    if (options?.providerId) setSelectedProviderId(options.providerId)
    if (options?.bookingId) setSelectedBookingId(options.bookingId)
    if (options?.petId) setSelectedPetId(options.petId)
    if (options?.conversationId) setSelectedConversationId(options.conversationId)
    if (options?.alertId) setSelectedAlertId(options.alertId)
  }, [])

  const goBack = useCallback(() => {
    console.log('Going back to activeTab:', activeTab)
    setSelectedProviderId(null)
    setSelectedBookingId(null)
    setSelectedPetId(null)
    setSelectedConversationId(null)
    setSelectedAlertId(null)
    setCurrentScreen(activeTab)
  }, [activeTab])

  // Initialize Android back button handler
  useEffect(() => {
    console.log('🔙 Initializing back button handler')
    try {
      initializeBackButtonHandler(goBack)
    } catch (error) {
      console.warn('Could not initialize back button:', error)
    }
    
    return () => {
      try {
        removeBackButtonHandler()
      } catch (error) {
        console.warn('Could not remove back button handler:', error)
      }
    }
  }, [goBack])

  // Initialize Push Notifications & FCM Token
  useEffect(() => {
    if (!user?.uid) {
      return
    }

    console.log('📱 Initializing push notifications for user:', user.uid)

    // Setup push notification listeners
    setupPushNotificationListeners((notification) => {
      console.log('Push notification received:', notification)
      
      // Handle notification tap - navigate to alert detail
      if (notification.type === 'sos_alert' && notification.alertId) {
        navigate('sos-detail', { alertId: notification.alertId })
      }
    })

    // Initialize and get FCM token
    initializePushNotifications()
      .then(async (fcmToken) => {
        if (fcmToken) {
          console.log('✅ FCM Token obtained:', fcmToken.substring(0, 20) + '...')
          
          // Save token to Firestore
          try {
            await updateUserFCMToken(user.uid, fcmToken)
            console.log('✅ FCM Token saved to Firestore')
          } catch (error) {
            console.error('❌ Failed to save FCM token:', error)
          }
        } else {
          console.log('⚠️ No FCM token received (might be web platform)')
        }
      })
      .catch((error) => {
        console.error('❌ Push notification initialization failed:', error)
      })

    // Update user location for geofenced notifications
    getCurrentPosition()
      .then(async (position) => {
        const { latitude, longitude } = position.coords
        console.log('📍 Updating user location:', latitude, longitude)
        
        try {
          await updateUserLocation(user.uid, latitude, longitude)
          console.log('✅ User location updated')
        } catch (error) {
          console.error('❌ Failed to update location:', error)
        }
      })
      .catch((error) => {
        console.warn('⚠️ Could not get user location:', error)
      })

    // Cleanup on unmount
    return () => {
      removePushNotificationListeners()
    }
  }, [user, navigate])

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
