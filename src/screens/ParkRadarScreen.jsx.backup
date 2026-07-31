import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Dog, 
  Users,
  CheckCircle,
  Clock,
  MapPin,
  List,
  Map as MapIcon
} from 'lucide-react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { getPetPlaces, getActiveCheckinsForPlace, checkInToPark, getPets, getPetById } from '../firebase/services'
import PetDetailModal from '../components/PetDetailModal'
import { getCurrentPosition } from '../utils/geolocation'

const MAPS_API_KEY = 'AIzaSyCT3CP1dnyycCUsvrmPjUWhaaKubSYC1AU'

const placeTypeIcons = {
  dog_park: '🏞️',
  vet_24h: '🏥',
  pet_cafe: '☕',
  pet_store: '🛒'
}

export default function ParkRadarScreen() {
  const { t, user } = useApp()
  
  const [viewMode, setViewMode] = useState('list') // Start with list (safer), can switch to map
  const [currentLocation, setCurrentLocation] = useState(null)
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Check-in state
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [checkinDuration, setCheckinDuration] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [activeCheckins, setActiveCheckins] = useState([])
  
  // Pet detail modal state
  const [selectedPetDetail, setSelectedPetDetail] = useState(null)
  const [selectedCheckin, setSelectedCheckin] = useState(null)
  const [showPetDetail, setShowPetDetail] = useState(false)
  
  // Get user location
  useEffect(() => {
    getCurrentPosition()
      .then((position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCurrentLocation(loc)
      })
      .catch((error) => {
        console.error('Geolocation error:', error)
        // Default to Wrocław
        setCurrentLocation({ lat: 51.1079, lng: 17.0385 })
      })
  }, [])
  
  // Load places
  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true)
      try {
        // Pass current location if available for distance sorting
        const allPlaces = await getPetPlaces(
          currentLocation?.lat, 
          currentLocation?.lng, 
          50 // 50km radius
        )
        console.log('🗺️ Loaded', allPlaces.length, 'places')
        setPlaces(allPlaces)
      } catch (error) {
        console.error('Error loading places:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlaces()
  }, [currentLocation])
  
  // Load pets for check-in
  useEffect(() => {
    if (!user?.uid) return
    
    getPets(user.uid)
      .then(userPets => setPets(userPets))
      .catch(err => console.error('Error loading pets:', err))
  }, [user])
  
  // Load active check-ins when place selected
  useEffect(() => {
    if (!selectedPlace) return
    
    const loadCheckIns = async () => {
      try {
        const checkins = await getActiveCheckinsForPlace(selectedPlace.id)
        setActiveCheckins(checkins)
      } catch (error) {
        console.error('Error loading check-ins:', error)
      }
    }
    
    loadCheckIns()
    const interval = setInterval(loadCheckIns, 30000) // Refresh every 30s
    
    return () => clearInterval(interval)
  }, [selectedPlace])
  
  const handlePlaceClick = (place) => {
    setSelectedPlace(place)
  }
  
  const handleCheckInClick = () => {
    if (pets.length === 0) {
      alert('Please add a pet first in Pet Passport')
      return
    }
    setShowCheckInDialog(true)
    if (pets.length === 1) {
      setSelectedPet(pets[0])
    }
  }
  
  const handleCheckInSubmit = async () => {
    if (!selectedPet || !selectedPlace || !user) return
    
    setSubmitting(true)
    try {
      await checkInToPark(
        user.uid,
        selectedPet.id,
        selectedPlace.id,
        checkinDuration
      )
      
      alert(`Checked in to ${selectedPlace.name}!`)
      setShowCheckInDialog(false)
      setSelectedPet(null)
      
      const updatedCheckins = await getActiveCheckinsForPlace(selectedPlace.id)
      setActiveCheckins(updatedCheckins)
    } catch (error) {
      console.error('Error checking in:', error)
      alert('Failed to check in')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handlePetClick = async (checkin) => {
    try {
      const petData = await getPetById(checkin.petId)
      if (petData) {
        setSelectedPetDetail(petData)
        setSelectedCheckin(checkin)
        setShowPetDetail(true)
      }
    } catch (error) {
      console.error('Error loading pet details:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dog className="animate-bounce mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Loading places...</p>
        </div>
      </div>
    )
  }

  return (
    <LoadScript 
      googleMapsApiKey={MAPS_API_KEY}
      onLoad={() => setMapLoaded(true)}
      onError={(error) => {
        console.error('Google Maps loading error:', error)
        setViewMode('list') // Fallback to list if Maps fails
      }}
    >
      <div className="min-h-screen bg-background pb-32">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <div className="flex-1">
            <h1 className="text-lg font-bold">Park Radar</h1>
            <p className="text-xs text-muted-foreground">{places.length} places nearby</p>
          </div>
          
          {/* Toggle between Map and List */}
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            {viewMode === 'map' ? (
              <>
                <List size={16} />
                Lista
              </>
            ) : (
              <>
                <MapIcon size={16} />
                Mapa
              </>
            )}
          </button>
        </div>
        
        {/* Map View */}
        {viewMode === 'map' && mapLoaded && currentLocation && (
          <div className="h-[calc(100vh-140px)]">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentLocation}
              zoom={13}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {/* User location marker */}
              <Marker
                position={currentLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#4F46E5',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
              
              {/* Place markers */}
              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={{ lat: place.location.lat, lng: place.location.lng }}
                  onClick={() => setSelectedPlace(place)}
                  icon={{
                    url: `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="20" y="30" font-size="30" text-anchor="middle">${placeTypeIcons[place.type]}</text></svg>`,
                  }}
                />
              ))}
              
              {/* Info Window for selected place */}
              {selectedPlace && (
                <InfoWindow
                  position={{ lat: selectedPlace.location.lat, lng: selectedPlace.location.lng }}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-sm mb-1">{selectedPlace.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{selectedPlace.location.address}</p>
                    <button
                      onClick={() => {
                        setShowCheckInDialog(true)
                      }}
                      className="w-full px-3 py-1.5 bg-primary text-white rounded text-xs font-medium"
                    >
                      Check In
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}
        
        {/* Loading map message */}
        {viewMode === 'map' && !mapLoaded && (
          <div className="h-[calc(100vh-140px)] flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="animate-pulse mx-auto mb-4" size={48} />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* List View */}
        {viewMode === 'list' && (
          <div className="p-4 space-y-3 pb-20">
            {places.map((place) => (
              <div
            key={place.id}
            onClick={() => handlePlaceClick(place)}
            className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${
              selectedPlace?.id === place.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{placeTypeIcons[place.type]}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{place.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {place.address}
                </p>
                {place.open247 && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    24/7 Open
                  </span>
                )}
              </div>
            </div>
            
            {selectedPlace?.id === place.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={16} />
                    <span>{activeCheckins.length} dogs here now</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCheckInClick()
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    Check In
                  </button>
                </div>
                
                {activeCheckins.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {activeCheckins.map((checkin) => (
                      <div
                        key={checkin.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePetClick(checkin)
                        }}
                        className="flex-shrink-0 w-16 text-center cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                          <Dog size={24} className="text-primary" />
                        </div>
                        <p className="text-xs font-medium truncate">{checkin.petName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
          </div>
        )}
        
        {/* Check-in dialog */}
        {showCheckInDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Check In</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Pet</label>
                <select
                  value={selectedPet?.id || ''}
                  onChange={(e) => {
                    const pet = pets.find(p => p.id === e.target.value)
                    setSelectedPet(pet)
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">Choose a pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={checkinDuration}
                  onChange={(e) => setCheckinDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCheckInDialog(false)
                  setSelectedPet(null)
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckInSubmit}
                disabled={!selectedPet || submitting}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
              >
                {submitting ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Pet Detail Modal */}
      {showPetDetail && selectedPetDetail && selectedCheckin && (
        <PetDetailModal
          pet={selectedPetDetail}
          checkin={selectedCheckin}
          onClose={() => {
            setShowPetDetail(false)
            setSelectedPetDetail(null)
            setSelectedCheckin(null)
          }}
        />
      )}
      </div>
    </LoadScript>
  )
}
