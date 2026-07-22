import { useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import FloatingSOSButton from './components/FloatingSOSButton'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import ProfileScreen from './screens/ProfileScreen'
import SOSScreen from './screens/SOSScreen'
import SOSDetailScreen from './screens/SOSDetailScreen'
import ParkRadarScreen from './screens/ParkRadarScreen'
import PetPassportScreen from './screens/PetPassportScreen'
import NotificationsScreen from './screens/NotificationsScreen'

// Legacy screens (hidden in MVP Phase 1, but kept for backward compatibility)
import BookingsScreen from './screens/BookingsScreen'
import MessagesScreen from './screens/MessagesScreen'
import SearchScreen from './screens/SearchScreen'
import ProviderProfileScreen from './screens/ProviderProfileScreen'
import CategoryScreen from './screens/CategoryScreen'
import BookingScreen from './screens/BookingScreen'
import BookingDetailScreen from './screens/BookingDetailScreen'
import SavedScreen from './screens/SavedScreen'
import ChatScreen from './screens/ChatScreen'
import TrackerScreen from './screens/TrackerScreen'
import TrackerStoreScreen from './screens/TrackerStoreScreen'
import ServicesScreen from './screens/ServicesScreen'

function App() {
  const { currentScreen, activeTab, user, navigate } = useApp()

  console.log('App render, currentScreen:', currentScreen, 'user:', !!user)

  // Public routes (no auth required)
  const publicRoutes = ['welcome']
  
  // Protected routes (auth required)
  const isProtectedRoute = !publicRoutes.includes(currentScreen)
  
  // If user tries to access protected route without being logged in, show welcome
  if (isProtectedRoute && !user) {
    console.log('⚠️ Auth required for', currentScreen, '- redirecting to welcome')
    return <WelcomeScreen />
  }
  
  // If user is logged in but on welcome screen, redirect to home
  if (user && currentScreen === 'welcome') {
    console.log('✅ User logged in, redirecting from welcome to home')
    navigate('home')
    return null
  }

  // Show welcome screen for public routes
  if (currentScreen === 'welcome') {
    return <WelcomeScreen />
  }

  const renderScreen = () => {
    // MVP Phase 1 - Primary screens
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />
      case 'park-radar':
        return <ParkRadarScreen />
      case 'pet-passport':
        return <PetPassportScreen />
      case 'profile':
        return <ProfileScreen />
      case 'sos':
        return <SOSScreen />
      case 'sos-detail':
        return <SOSDetailScreen />
      case 'notifications':
        return <NotificationsScreen />
      
      // Legacy screens (kept for backward compatibility, not in main nav)
      case 'bookings':
        return <BookingsScreen />
      case 'messages':
        return <MessagesScreen />
      case 'saved':
        return <SavedScreen />
      case 'tracker':
        return <TrackerScreen />
      case 'tracker-store':
        return <TrackerStoreScreen />
      case 'search-sitter':
      case 'search-groomer':
      case 'search-vet':
        return <SearchScreen />
      case 'category':
        return <CategoryScreen />
      case 'provider-profile':
        return <ProviderProfileScreen />
      case 'booking':
        return <BookingScreen />
      case 'booking-detail':
        return <BookingDetailScreen />
      case 'chat':
        return <ChatScreen />
      case 'services':
        return <ServicesScreen />
      default:
        return <HomeScreen />
    }
  }

  // Show bottom nav on all screens except welcome
  const showBottomNav = !['welcome'].includes(currentScreen) && user
  
  // Show floating SOS button on main screens (not on SOS screen itself or welcome)
  const showSOSButton = !['sos', 'sos-detail', 'welcome', 'notifications'].includes(currentScreen) && user

  return (
    <>
      {renderScreen()}
      {showBottomNav && <BottomNav />}
      {showSOSButton && <FloatingSOSButton />}
    </>
  )
}

export default App
