import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { 
  Dog, 
  Users,
  CheckCircle,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { getPetPlaces, getActiveCheckinsForPlace, checkInToPark, getPets, getPetById } from '../firebase/services'
import PetDetailModal from '../components/PetDetailModal'
import { getCurrentPosition } from '../utils/geolocation'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

const placeTypeIcons = {
  dog_park: '🏞️',
  vet_24h: '🏥',
  pet_cafe: '☕',
  pet_store: '🛒'
}

export default function ParkRadarScreen() {
  const { t, goBack, user } = useApp()
  
  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 52.2297, lng: 21.0122 })
  const [currentLocation, setCurrentLocation] = useState(null)
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  
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
        setMapCenter(loc)
      })
      .catch((error) => {
        console.error('Geolocation error:', error)
        // Default to Wrocław
        setMapCenter({ lat: 51.1079, lng: 17.0385 })
      })
  }, [])
  
  // Load places
  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true)
      try {
        const center = currentLocation || mapCenter
        const data = await getPetPlaces(center.lat, center.lng, 10)
        setPlaces(data)
        console.log('📍 Loaded', data.length, 'pet-friendly places')
      } catch (error) {
        console.error('Error loading places:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPlaces()
  }, [currentLocation])
  
  // Load pets
  useEffect(() => {
    const loadPets = async () => {
      if (!user?.uid) return
      
      try {
        const data = await getPets(user.uid)
        setPets(data)
      } catch (error) {
        console.error('Error loading pets:', error)
      }
    }
    
    loadPets()
  }, [user])
  
  // Load check-ins
  useEffect(() => {
    if (!selectedPlace) {
      setActiveCheckins([])
      return
    }
    
    const loadCheckins = async () => {
      try {
        const data = await getActiveCheckinsForPlace(selectedPlace.id)
        setActiveCheckins(data)
      } catch (error) {
        console.error('Error loading check-ins:', error)
      }
    }
    
    loadCheckins()
    const interval = setInterval(loadCheckins, 30000)
    
    // Real-time listener for check-in updates
    const handleCheckinsUpdated = (event) => {
      if (event.detail.placeId === selectedPlace.id) {
        loadCheckins()
      }
    }
    window.addEventListener('parkCheckinsUpdated', handleCheckinsUpdated)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('parkCheckinsUpdated', handleCheckinsUpdated)
    }
  }, [selectedPlace])
  
  const handleMarkerClick = (place) => {
    setSelectedPlace(place)
  }
  
  const handleCheckInClick = () => {
    if (pets.length === 0) {
      alert('Please add a pet in Pet Passport first!')
      return
    }
    setShowCheckInDialog(true)
  }
  
  const handleCheckInSubmit = async () => {
    if (!selectedPet || !selectedPlace || !user) return
    
    setSubmitting(true)
    try {
      await checkInToPark(
        user.uid,
        user.name || 'User',
        selectedPet.id,
        selectedPet.name,
        selectedPet.photos?.[0] || null,
        selectedPlace.id,
        selectedPlace.name,
        selectedPlace.location.lat,
        selectedPlace.location.lng,
        checkinDuration
      )
      
      const updated = await getActiveCheckinsForPlace(selectedPlace.id)
      setActiveCheckins(updated)
      
      setShowCheckInDialog(false)
      setSelectedPet(null)
      
      alert(`${selectedPet.name} checked in at ${selectedPlace.name}! 🎉`)
    } catch (error) {
      console.error('Error checking in:', error)
      alert('Error checking in.')
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
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={goBack} className="p-2 hover:bg-secondary rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Park Radar</h1>
          <p className="text-xs text-muted-foreground">{places.length} places nearby</p>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          options={mapOptions}
        >
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                scale: 8,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
          )}
          
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.location.lat, lng: place.location.lng }}
              onClick={() => handleMarkerClick(place)}
              label={{
                text: placeTypeIcons[place.type] || '📍',
                fontSize: '24px'
              }}
            />
          ))}
        </GoogleMap>
        
        {selectedPlace && (
          <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-2xl p-4 shadow-xl max-h-[60vh] overflow-y-auto">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-3xl">{placeTypeIcons[selectedPlace.type]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{selectedPlace.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlace.description}</p>
              </div>
              <button onClick={() => setSelectedPlace(null)}>✕</button>
            </div>
            
            {selectedPlace.type === 'dog_park' && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm font-semibold">
                    {activeCheckins.length} {activeCheckins.length === 1 ? 'dog' : 'dogs'} here now
                  </span>
                </div>
                
                {activeCheckins.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {activeCheckins.slice(0, 6).map((checkin) => (
                      <button
                        key={checkin.id}
                        onClick={() => handlePetClick(checkin)}
                        className="flex flex-col items-center text-center hover:bg-secondary/50 rounded-xl p-2 transition-colors"
                      >
                        {checkin.petPhoto ? (
                          <img
                            src={checkin.petPhoto}
                            alt={checkin.petName}
                            className="w-12 h-12 rounded-full object-cover mb-1 ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-1 ring-2 ring-primary/20">
                            <Dog size={20} />
                          </div>
                        )}
                        <p className="text-xs font-medium truncate w-full">{checkin.petName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {selectedPlace.type === 'dog_park' && user && (
              <button onClick={handleCheckInClick} className="w-full btn btn-primary btn-sm">
                <CheckCircle size={16} className="mr-2" />
                Check In
              </button>
            )}
          </div>
        )}
      </div>
      
      {showCheckInDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Check in to park</h3>
            
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Select pet</label>
              <div className="space-y-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 ${
                      selectedPet?.id === pet.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    {pet.photos?.[0] ? (
                      <img src={pet.photos[0]} alt={pet.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Dog size={20} />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">{pet.breed || pet.species}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block">
                <Clock size={14} className="inline mr-1" />
                Duration
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setCheckinDuration(hours)}
                    className={`flex-1 py-2 rounded-xl border-2 font-semibold ${
                      checkinDuration === hours
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckInDialog(false)
                  setSelectedPet(null)
                }}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckInSubmit}
                disabled={!selectedPet || submitting}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {submitting ? 'Checking in...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPetDetail && (
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
  )
}
