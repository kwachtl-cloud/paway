import { useState, useEffect } from 'react'
import { 
  Bell, 
  Menu, 
  MapPin, 
  Users, 
  AlertCircle, 
  Calendar, 
  MoreHorizontal,
  Plus,
  ChevronDown,
  Bookmark,
  AlertTriangle
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getPets, getSOSAlertsNearby } from '../firebase/services'
import SOSAlertCard from '../components/SOSAlertCard'
import { getCurrentPosition } from '../utils/geolocation'

export default function HomeScreen() {
  const { user, navigate, t } = useApp()
  const [selectedPet, setSelectedPet] = useState(null)
  const [pets, setPets] = useState([])
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [sosAlerts, setSosAlerts] = useState([])
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
          const alerts = await getSOSAlertsNearby(loc.lat, loc.lng, 10) // 10km radius
          setSosAlerts(alerts.slice(0, 3)) // Show max 3 on home
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
      color: 'bg-green-50 text-green-600',
      screen: 'park-radar'
    },
    { 
      id: 'meetups', 
      icon: Users, 
      label: 'Meetups', 
      color: 'bg-gray-100 text-gray-600',
      screen: 'home' // TODO: Add meetups screen
    },
    { 
      id: 'alerts', 
      icon: AlertCircle, 
      label: 'Alerts', 
      color: 'bg-red-50 text-red-600',
      screen: 'sos'
    },
    { 
      id: 'events', 
      icon: Calendar, 
      label: 'Events', 
      color: 'bg-orange-50 text-orange-600',
      screen: 'home' // TODO: Add events screen
    },
    { 
      id: 'more', 
      icon: MoreHorizontal, 
      label: 'More', 
      color: 'bg-gray-100 text-gray-600',
      screen: 'profile'
    },
  ]

  // Mock data for meetups
  const upcomingMeetups = [
    {
      id: 1,
      title: 'Morning Playdate',
      date: 'Sat, 24 May',
      time: '10:00',
      location: 'Riverside Dog Park',
      participants: [
        { id: 1, avatar: '🐕' },
        { id: 2, avatar: '🐕' },
        { id: 3, avatar: '🐕' },
        { id: 4, avatar: '🐕' },
      ],
      extraCount: 8,
      image: null
    }
  ]

  // Mock data for recommendations
  const recommendations = [
    {
      id: 1,
      name: 'Pawsome Café',
      type: 'Dog-friendly café',
      distance: '1.2 km',
      image: null,
      saved: false
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card sticky top-0 z-10 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {/* TODO: Add menu */}} 
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} className="text-foreground" />
          </button>
          
          <h1 className="text-xl font-bold text-foreground tracking-wide">PAWAY</h1>
          
          <button 
            onClick={() => navigate('notifications')}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={24} className="text-foreground" />
            {/* Notification badge */}
            {sosAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Pet Selector */}
      <div className="px-4 py-4">
        <button
          onClick={() => setShowPetSelector(!showPetSelector)}
          className="w-full bg-card rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            {selectedPet ? (
              <>
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedPet.photos?.[0] ? (
                    <img 
                      src={selectedPet.photos[0].preview || selectedPet.photos[0]} 
                      alt={selectedPet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">🐕</span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-foreground">{selectedPet.name}</span>
                    <ChevronDown size={20} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedPet.breed || selectedPet.species} • {selectedPet.age || 'Unknown age'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-left">
                <span className="font-semibold text-lg text-foreground">Select your pet</span>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate('pet-passport')
            }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} className="text-white" />
          </button>
        </button>

        {/* Pet Selector Dropdown */}
        {showPetSelector && pets.length > 1 && (
          <div className="mt-2 bg-card rounded-2xl shadow-lg p-2 space-y-1">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => {
                  setSelectedPet(pet)
                  setShowPetSelector(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {pet.photos?.[0] ? (
                    <img 
                      src={pet.photos[0].preview || pet.photos[0]} 
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🐕</span>
                  )}
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground">{pet.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {pet.breed || pet.species}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.screen)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center transition-transform active:scale-95`}>
                <action.icon size={24} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active SOS Alerts */}
      {sosAlerts.length > 0 && (
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600" />
              {t('activeSOSAlerts') || 'Active Alerts'}
            </h2>
            <button 
              onClick={() => navigate('sos')}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              {t('viewAll') || 'View all'}
            </button>
          </div>
          
          <div className="space-y-3">
            {sosAlerts.map(alert => (
              <SOSAlertCard
                key={alert.id}
                alert={alert}
                onClick={() => navigate('sos-detail', { alertId: alert.id })}
              />
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            {t('showingAlertsWithin') || 'Showing alerts within'} 10km
          </p>
        </div>
      )}

      {/* Explore Near You */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Explore near you</h2>
          <button 
            onClick={() => navigate('park-radar')}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            See all
          </button>
        </div>
        
        {/* Mini Map */}
        <button
          onClick={() => navigate('park-radar')}
          className="w-full h-48 bg-gray-100 rounded-3xl overflow-hidden relative shadow-sm hover:shadow-md transition-all"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tap to explore places</p>
            </div>
          </div>
        </button>
      </div>

      {/* Upcoming Meetups */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Upcoming meetups</h2>
        
        <div className="space-y-3">
          {upcomingMeetups.map((meetup) => (
            <div key={meetup.id} className="bg-card rounded-3xl p-4 shadow-sm">
              <div className="flex gap-4">
                {/* Meetup Image */}
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {meetup.image ? (
                    <img src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={32} className="text-gray-400" />
                  )}
                </div>
                
                {/* Meetup Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground mb-1">{meetup.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Calendar size={14} />
                    <span>{meetup.date} • {meetup.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin size={14} />
                    <span>{meetup.location}</span>
                  </div>
                  
                  {/* Participants */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {meetup.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs"
                        >
                          {participant.avatar}
                        </div>
                      ))}
                      {meetup.extraCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                          +{meetup.extraCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Join Button */}
                <div className="flex items-center">
                  <button className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended for You */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Recommended for you</h2>
        
        <div className="space-y-3">
          {recommendations.map((place) => (
            <div key={place.id} className="bg-card rounded-3xl p-4 shadow-sm">
              <div className="flex gap-4">
                {/* Place Image */}
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {place.image ? (
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <MapPin size={32} className="text-gray-400" />
                  )}
                </div>
                
                {/* Place Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground mb-1">{place.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{place.type}</p>
                  <p className="text-sm text-muted-foreground">{place.distance}</p>
                </div>
                
                {/* Bookmark Button */}
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                  <Bookmark size={20} className={place.saved ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
