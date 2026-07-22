import { useState, useEffect } from 'react'
import { 
  Bell, 
  MapPin, 
  Users, 
  AlertCircle, 
  Calendar, 
  ChevronDown,
  Heart
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getPets, getSOSAlertsNearby } from '../firebase/services'
import SOSAlertCard from '../components/SOSAlertCard'
import { getCurrentPosition } from '../utils/geolocation'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import StatusPill from '../components/StatusPill'
import Card from '../components/Card'

export default function HomeScreen() {
  const { user, navigate, t } = useApp()
  const [selectedPet, setSelectedPet] = useState(null)
  const [pets, setPets] = useState([])
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [myAlerts, setMyAlerts] = useState([]) // My pet's alerts
  const [nearbyAlerts, setNearbyAlerts] = useState([]) // Other pets' alerts nearby
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Load pets
  useEffect(() => {
    if (user?.uid) {
      getPets(user.uid).then(userPets => {
        setPets(userPets)
        if (userPets.length > 0 && !selectedPet) {
          setSelectedPet(userPets[0])
        }
      }).catch(err => console.error('Error loading pets:', err))
    }
  }, [user])

  // Get user location and load nearby alerts
  useEffect(() => {
    if (!user?.uid) return
    
    getCurrentPosition()
      .then(async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        
        // Load nearby SOS alerts
        try {
          setLoadingAlerts(true)
          const allAlerts = await getSOSAlertsNearby(loc.lat, loc.lng, 10) // 10km radius
          
          // Split into my alerts and nearby alerts
          const mine = allAlerts.filter(alert => alert.userId === user.uid)
          const others = allAlerts.filter(alert => alert.userId !== user.uid)
          
          setMyAlerts(mine)
          setNearbyAlerts(others.slice(0, 5)) // Show max 5 nearby alerts on home
        } catch (error) {
          console.error('Error loading SOS alerts:', error)
        } finally {
          setLoadingAlerts(false)
        }
      })
      .catch((error) => {
        console.error('Geolocation error:', error)
      })
  }, [user])

  // Quick Actions
  const quickActions = [
    { 
      id: 'places', 
      icon: MapPin, 
      label: 'Places',
      color: 'teal',
      screen: 'messages'
    },
    { 
      id: 'meetups', 
      icon: Users, 
      label: 'Community',
      color: 'blue-1',
      screen: 'messages'
    },
    { 
      id: 'alerts', 
      icon: AlertCircle, 
      label: 'SOS',
      color: 'coral',
      screen: 'sos'
    },
    { 
      id: 'events', 
      icon: Calendar, 
      label: 'Events',
      color: 'amber',
      screen: 'pet-passport'
    },
  ]

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      {/* Dark Header */}
      <DarkHeader
        rightAction={
          <button 
            onClick={() => navigate('notifications')}
            className="p-2 -mr-2 active:scale-95 transition-transform"
          >
            <Bell size={24} />
          </button>
        }
      >
        {/* Pet Selector */}
        <div className="px-4 pb-6 pt-2">
          <button
            onClick={() => setShowPetSelector(!showPetSelector)}
            className="flex items-center gap-3 bg-bg-darker rounded-2xl px-4 py-3 w-full active:scale-98 transition-transform"
          >
            {selectedPet ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center text-2xl">
                  {selectedPet.species === 'dog' ? '🐕' : selectedPet.species === 'cat' ? '🐱' : '🐾'}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="font-poppins font-bold text-card text-base">
                    {selectedPet.name}
                  </h2>
                  <p className="font-inter text-text-gray text-xs">
                    {selectedPet.breed || 'Mixed breed'}
                  </p>
                </div>
                <ChevronDown 
                  size={20} 
                  className="text-text-gray transition-transform"
                  style={{ transform: showPetSelector ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-card-2 flex items-center justify-center">
                  <Heart size={24} className="text-text-gray" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-inter text-text-gray text-sm">
                    Add your first pet
                  </p>
                </div>
                <ChevronDown size={20} className="text-text-gray" />
              </>
            )}
          </button>
          
          {/* Pet Selector Dropdown */}
          {showPetSelector && pets.length > 0 && (
            <div className="mt-2 bg-bg-darker rounded-2xl overflow-hidden">
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => {
                    setSelectedPet(pet)
                    setShowPetSelector(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full hover:bg-bg-dark/50 transition-colors active:scale-98"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-1/50 to-lime-2/50 flex items-center justify-center text-xl">
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-inter font-medium text-card text-sm">
                      {pet.name}
                    </p>
                    <p className="font-inter text-text-gray text-xs">
                      {pet.breed || 'Mixed'}
                    </p>
                  </div>
                  {pet.id === selectedPet?.id && (
                    <div className="w-2 h-2 rounded-full bg-lime-1" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DarkHeader>

      {/* White Card Content */}
      <WhiteCard>
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="font-poppins font-semibold text-text-dark text-base mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => navigate(action.screen)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `rgba(var(--${action.color}-rgb, 128, 128, 128), 0.12)` }}
                  >
                    <Icon size={24} style={{ color: `var(--${action.color})` }} />
                  </div>
                  <span className="font-inter text-xs text-text-dark font-medium text-center">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* My SOS Alerts Section */}
        {myAlerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-semibold text-text-dark text-base">
                My SOS Alerts
              </h3>
              <StatusPill color="coral">
                {myAlerts.length} Active
              </StatusPill>
            </div>
            <div className="space-y-3">
              {myAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="bg-coral/5 border-l-4 border-coral rounded-xl overflow-hidden"
                >
                  <SOSAlertCard 
                    alert={alert}
                    onClick={() => navigate('sos-detail', { alertId: alert.id })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby SOS Alerts Section */}
        {nearbyAlerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-semibold text-text-dark text-base">
                Nearby SOS Alerts
              </h3>
              <button
                onClick={() => navigate('sos')}
                className="font-inter text-sm text-lime-2 font-semibold"
              >
                See All
              </button>
            </div>
            {loadingAlerts ? (
              <div className="text-center py-8">
                <p className="font-inter text-text-gray text-sm">
                  Loading alerts...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyAlerts.map(alert => (
                  <Card
                    key={alert.id}
                    onClick={() => navigate('sos-detail', { alertId: alert.id })}
                  >
                    <SOSAlertCard alert={alert} />
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loadingAlerts && myAlerts.length === 0 && nearbyAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-teal" />
            </div>
            <h3 className="font-poppins font-semibold text-text-dark text-lg mb-2">
              All Clear!
            </h3>
            <p className="font-inter text-text-gray text-sm max-w-xs mx-auto">
              No active SOS alerts in your area. Your pets are safe! 🐾
            </p>
          </div>
        )}
      </WhiteCard>
    </div>
  )
}
