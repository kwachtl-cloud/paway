import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Dog, 
  Users,
  MapPin,
  List,
  Map as MapIcon,
  Locate,
  Plus,
  Minus
} from 'lucide-react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { getPetPlaces, getActiveCheckinsForPlace, checkInToPark, getPets, getPetById } from '../firebase/services'
import PetDetailModal from '../components/PetDetailModal'
import { getCurrentPosition } from '../utils/geolocation'
import DarkHeader from '../components/DarkHeader'
import Card from '../components/Card'
import StatusPill from '../components/StatusPill'
import Button from '../components/Button'

const MAPS_API_KEY = 'AIzaSyCT3CP1dnyycCUsvrmPjUWhaaKubSYC1AU'

const placeTypeIcons = {
  dog_park: '🏞️',
  vet_24h: '🏥',
  pet_cafe: '☕',
  pet_store: '🛒'
}

const placeTypeLabels = {
  dog_park: 'Dog Park',
  vet_24h: 'Vet 24/7',
  pet_cafe: 'Pet Café',
  pet_store: 'Pet Store'
}

const placeTypeColors = {
  dog_park: 'green',
  vet_24h: 'teal',
  pet_cafe: 'amber',
  pet_store: 'blue'
}

export default function ParkRadarScreen() {
  const { t, user } = useApp()
  
  const [viewMode, setViewMode] = useState('list') // Start with list (safer), can switch to map
  const [currentLocation, setCurrentLocation] = useState(null)
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapRef, setMapRef] = useState(null)
  
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

  const handleRecenterMap = () => {
    if (mapRef && currentLocation) {
      mapRef.panTo(currentLocation)
      mapRef.setZoom(13)
    }
  }

  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.setZoom(mapRef.getZoom() - 1)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <Dog className="animate-bounce mx-auto mb-4 text-lime-1" size={48} />
          <p className="font-inter text-text-gray">Loading places...</p>
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
      <div className="min-h-screen bg-bg-dark pb-24 relative">
        {/* Overlay DarkHeader with view toggle */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <DarkHeader 
            title="Park Radar"
            subtitle={`${places.length} places nearby`}
            showBack={false}
          >
            <div className="px-4 pb-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-poppins font-semibold transition-all ${
                  viewMode === 'map' 
                    ? 'bg-lime-gradient text-bg-dark' 
                    : 'bg-card-2 text-text-dark'
                }`}
              >
                <MapIcon size={18} />
                Mapa
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-poppins font-semibold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-lime-gradient text-bg-dark' 
                    : 'bg-card-2 text-text-dark'
                }`}
              >
                <List size={18} />
                Lista
              </button>
            </div>
          </DarkHeader>
        </div>
        
        {/* Map View */}
        {viewMode === 'map' && mapLoaded && currentLocation && (
          <div className="h-screen">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={currentLocation}
              zoom={13}
              onLoad={map => setMapRef(map)}
              options={{
                disableDefaultUI: true,
                zoomControl: false,
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
                  fillColor: '#B7E86B',
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
                    <h3 className="font-poppins font-semibold text-sm mb-1">{selectedPlace.name}</h3>
                    <p className="font-inter text-xs text-text-faint mb-2">{selectedPlace.location.address}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCheckInClick()
                      }}
                      className="w-full px-3 py-2 bg-lime-gradient text-bg-dark rounded-lg font-poppins font-semibold text-xs"
                    >
                      Check In
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            {/* Map Control Buttons (absolute positioned) */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-3 z-20">
              <button
                onClick={handleRecenterMap}
                className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Locate size={20} className="text-text-dark" />
              </button>
              <button
                onClick={handleZoomIn}
                className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Plus size={20} className="text-text-dark" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Minus size={20} className="text-text-dark" />
              </button>
            </div>
          </div>
        )}
        
        {/* Loading map message */}
        {viewMode === 'map' && !mapLoaded && (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="animate-pulse mx-auto mb-4 text-lime-1" size={48} />
              <p className="font-inter text-text-gray">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* List View */}
        {viewMode === 'list' && (
          <div className="pt-48 px-4 space-y-3 pb-20">
            {places.map((place) => (
              <Card
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className={`cursor-pointer transition-all ${
                  selectedPlace?.id === place.id ? 'ring-2 ring-lime-2' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{placeTypeIcons[place.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-poppins font-semibold text-text-dark">{place.name}</h3>
                      <StatusPill color={placeTypeColors[place.type]}>
                        {placeTypeLabels[place.type]}
                      </StatusPill>
                    </div>
                    <p className="font-inter text-xs text-text-faint flex items-center gap-1">
                      <MapPin size={12} />
                      {place.address}
                    </p>
                    {place.open247 && (
                      <StatusPill color="teal" className="mt-2">
                        24/7 Open
                      </StatusPill>
                    )}
                  </div>
                </div>
                
                {selectedPlace?.id === place.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusPill color="lime">
                          <Users size={14} />
                          <span className="ml-1">{activeCheckins.length} psów tu teraz</span>
                        </StatusPill>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCheckInClick()
                        }}
                      >
                        Check In
                      </Button>
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
                            <div className="w-16 h-16 rounded-full bg-lime-gradient flex items-center justify-center mb-1">
                              <Dog size={24} className="text-bg-dark" />
                            </div>
                            <p className="font-inter text-xs font-medium text-text-dark truncate">{checkin.petName}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* Check-in dialog */}
        {showCheckInDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
              <h2 className="font-poppins font-bold text-xl text-text-dark mb-4">Check In</h2>
            
              <div className="space-y-4">
                <div>
                  <label className="block font-poppins font-medium text-sm text-text-dark mb-2">Select Pet</label>
                  <select
                    value={selectedPet?.id || ''}
                    onChange={(e) => {
                      const pet = pets.find(p => p.id === e.target.value)
                      setSelectedPet(pet)
                    }}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-card-2 text-text-dark font-inter focus:ring-2 focus:ring-lime-2 outline-none"
                  >
                    <option value="">Choose a pet</option>
                    {pets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block font-poppins font-medium text-sm text-text-dark mb-2">Duration</label>
                  <select
                    value={checkinDuration}
                    onChange={(e) => setCheckinDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-card-2 text-text-dark font-inter focus:ring-2 focus:ring-lime-2 outline-none"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCheckInDialog(false)
                    setSelectedPet(null)
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCheckInSubmit}
                  disabled={!selectedPet || submitting}
                  className="flex-1"
                >
                  {submitting ? 'Checking in...' : 'Check In'}
                </Button>
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
