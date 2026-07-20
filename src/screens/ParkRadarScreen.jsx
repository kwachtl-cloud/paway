import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Dog, 
  Users,
  CheckCircle,
  ArrowLeft,
  Clock,
  MapPin
} from 'lucide-react'
import { getPetPlaces, getActiveCheckinsForPlace, checkInToPark, getPets, getPetById } from '../firebase/services'
import PetDetailModal from '../components/PetDetailModal'
import { getCurrentPosition } from '../utils/geolocation'

const placeTypeIcons = {
  dog_park: '🏞️',
  vet_24h: '🏥',
  pet_cafe: '☕',
  pet_store: '🛒'
}

export default function ParkRadarScreen() {
  const { t, goBack, user } = useApp()
  
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
        const allPlaces = await getPetPlaces()
        setPlaces(allPlaces)
      } catch (error) {
        console.error('Error loading places:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPlaces()
  }, [])
  
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
  )
}
