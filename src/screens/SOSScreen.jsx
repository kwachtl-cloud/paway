import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { AlertTriangle, CheckCircle, MapPin, Loader2, Phone, ArrowLeft, ChevronRight } from 'lucide-react'
import { sendSOSAlert, updateUserLocation, getPets } from '../firebase/services'
import { getCurrentPosition } from '../utils/geolocation'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Button from '../components/Button'
import StatusPill from '../components/StatusPill'
import Card from '../components/Card'

export default function SOSScreen() {
  const { t, goBack, navigate, user } = useApp()
  const [step, setStep] = useState(1) // 1: select pet, 2: details, 3: confirm, 4: sent
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [nearbyCount, setNearbyCount] = useState(0)
  
  // Pet selection
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [loadingPets, setLoadingPets] = useState(true)
  
  // Alert details
  const [location, setLocation] = useState(null)
  const [description, setDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [lastSeenTime, setLastSeenTime] = useState('')
  
  // Load user's pets
  useEffect(() => {
    if (!user?.uid) {
      setLoadingPets(false)
      return
    }
    
    getPets(user.uid)
      .then(userPets => {
        setPets(userPets)
        if (userPets.length === 1) {
          setSelectedPet(userPets[0])
        }
      })
      .catch(err => console.error('Error loading pets:', err))
      .finally(() => setLoadingPets(false))
  }, [user])
  
  // Get current location
  useEffect(() => {
    if (step >= 2) {
      getCurrentPosition()
        .then((pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }
          setLocation(loc)
          
          // Save user location for nearby search
          if (user?.uid) {
            updateUserLocation(user.uid, loc.lat, loc.lng).catch(err => 
              console.error('Error updating location:', err)
            )
          }
        })
        .catch((error) => {
          console.error('Geolocation error:', error)
          // Default location (Wroclaw center) if denied
          setLocation({ lat: 51.1079, lng: 17.0385 })
        })
    }
  }, [step, user])
  
  const handleSendAlert = async () => {
    if (!selectedPet || !location || !user) return
    
    setSending(true)
    console.log('🚨 Starting SOS alert send...', {
      pet: selectedPet.name,
      location,
      description: description.substring(0, 50)
    })
    
    try {
      console.log('📡 Calling sendSOSAlert...')
      const result = await sendSOSAlert({
        userId: user.uid,
        userName: user.name || 'User',
        petId: selectedPet.id,
        petName: selectedPet.name,
        petPhoto: selectedPet.photos?.[0] || null,
        petBreed: selectedPet.breed || selectedPet.species,
        lat: location.lat,
        lng: location.lng,
        description: description.trim(),
        contactPhone: contactPhone.trim() || user.phone || '',
        lastSeenTime: lastSeenTime || null,
      })
      
      console.log('✅ SOS alert sent successfully:', result)
      setNearbyCount(result.nearbyCount || 0)
      setSent(true)
      setStep(4)
    } catch (error) {
      console.error('❌ Error sending SOS:', error)
      alert('Error sending alert: ' + error.message)
    } finally {
      setSending(false)
      console.log('🏁 SOS send process complete')
    }
  }

  if (loadingPets) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 size={32} className="text-lime-1 animate-spin" />
      </div>
    )
  }

  // Step 4: Success Screen
  if (sent) {
    return (
      <div className="min-h-screen bg-bg-dark pb-24">
        <DarkHeader 
          title="Alert Sent!"
          onBack={() => {
            setSent(false)
            setStep(1)
            goBack()
          }}
        />
        
        <WhiteCard>
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mb-6">
              <CheckCircle size={48} className="text-teal" />
            </div>
            
            <h2 className="font-poppins font-bold text-2xl text-text-dark mb-3">
              SOS Alert Sent
            </h2>
            
            <StatusPill color="coral" className="mb-4">
              URGENT - {nearbyCount} nearby users notified
            </StatusPill>
            
            <p className="font-inter text-text-gray text-sm max-w-xs leading-relaxed mb-8">
              Your alert has been sent to {nearbyCount} pet owners within 10km. They can contact you directly if they see {selectedPet?.name}.
            </p>
            
            <div className="w-full space-y-3">
              <Button 
                variant="primary" 
                onClick={() => navigate('home')}
                className="w-full"
              >
                Back to Home
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => navigate('messages')}
                className="w-full"
              >
                Check Messages
              </Button>
            </div>
          </div>
        </WhiteCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      <DarkHeader 
        title="SOS Alert"
        onBack={step > 1 ? () => setStep(step - 1) : goBack}
      >
        {/* Hero section with large icon */}
        <div className="px-4 pb-6 pt-2 text-center">
          <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={40} className="text-coral" />
          </div>
          <h2 className="font-poppins font-semibold text-lg text-card mb-2">
            Report Lost Pet
          </h2>
          <p className="font-inter text-text-gray text-sm">
            Alert nearby pet owners instantly
          </p>
        </div>
      </DarkHeader>
      
      <WhiteCard>
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={`h-1 rounded-full transition-all ${
                s === step ? 'w-12 bg-lime-2' : 
                s < step ? 'w-6 bg-lime-1' : 'w-6 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Pet */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-poppins font-semibold text-base text-text-dark mb-1">
                Select Your Pet
              </h3>
              <p className="font-inter text-sm text-text-gray mb-4">
                Which pet is missing?
              </p>
            </div>
            
            {pets.length === 0 ? (
              <Card className="text-center py-8">
                <AlertTriangle size={32} className="text-amber mx-auto mb-4" />
                <p className="font-inter text-text-dark mb-4">
                  No pets added yet
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('pet-passport')}
                >
                  Add Your First Pet
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {pets.map(pet => (
                  <Card
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet)
                      setStep(2)
                    }}
                    className={`cursor-pointer hover:border-lime-2 transition-colors ${
                      selectedPet?.id === pet.id ? 'border-lime-2 border-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {pet.photos?.[0] ? (
                        <img
                          src={pet.photos[0]}
                          alt={pet.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-lime-1 to-lime-2 rounded-xl flex items-center justify-center text-2xl">
                          {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-poppins font-semibold text-text-dark">{pet.name}</p>
                        <p className="font-inter text-sm text-text-gray">{pet.breed || pet.species}</p>
                      </div>
                      <ChevronRight size={20} className="text-text-gray" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && selectedPet && (
          <div className="space-y-6">
            <div>
              <h3 className="font-poppins font-semibold text-base text-text-dark mb-1">
                Alert Details
              </h3>
              <p className="font-inter text-sm text-text-gray mb-4">
                Help others identify {selectedPet.name}
              </p>
            </div>
            
            {/* Selected Pet Preview */}
            <Card>
              <div className="flex items-center gap-3">
                {selectedPet.photos?.[0] ? (
                  <img
                    src={selectedPet.photos[0]}
                    alt={selectedPet.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-lime-1 to-lime-2 rounded-xl flex items-center justify-center text-xl">
                    {selectedPet.species === 'dog' ? '🐕' : '🐱'}
                  </div>
                )}
                <div>
                  <p className="font-poppins font-semibold text-text-dark">{selectedPet.name}</p>
                  <p className="font-inter text-sm text-text-gray">{selectedPet.breed || selectedPet.species}</p>
                </div>
              </div>
            </Card>

            {/* Last Seen Time */}
            <div>
              <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                Last Seen When?
              </label>
              <input
                type="datetime-local"
                value={lastSeenTime}
                onChange={(e) => setLastSeenTime(e.target.value)}
                className="w-full px-4 py-3 bg-card-2 text-text-dark rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                What Happened?
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe where and when you last saw your pet..."
                maxLength={200}
                className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none resize-none font-inter text-sm"
              />
              <p className="text-xs text-text-faint mt-1 font-inter">{description.length}/200</p>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                <Phone size={14} className="inline mr-1" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+48 123 456 789"
                className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
              />
            </div>

            {/* Location Info */}
            {location && (
              <Card className="bg-teal/5 border-teal/20">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-teal" />
                  <span className="font-inter text-xs text-teal">Current location detected</span>
                </div>
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedPet && (
          <div className="space-y-6">
            <div>
              <h3 className="font-poppins font-semibold text-base text-text-dark mb-1">
                Confirm Alert
              </h3>
              <p className="font-inter text-sm text-text-gray mb-4">
                Review before sending
              </p>
            </div>
            
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedPet.photos?.[0] && (
                    <img
                      src={selectedPet.photos[0]}
                      alt={selectedPet.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-poppins font-bold text-lg text-text-dark">{selectedPet.name}</p>
                    <p className="font-inter text-sm text-text-gray">{selectedPet.breed || selectedPet.species}</p>
                  </div>
                </div>
                
                {description && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-inter text-xs text-text-gray mb-1">Description</p>
                    <p className="font-inter text-sm text-text-dark">{description}</p>
                  </div>
                )}
                
                {contactPhone && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-inter text-xs text-text-gray mb-1">Contact Phone</p>
                    <p className="font-inter text-sm text-text-dark font-mono">{contactPhone}</p>
                  </div>
                )}
                
                {lastSeenTime && (
                  <div className="pt-3 border-t border-border">
                    <p className="font-inter text-xs text-text-gray mb-1">Last Seen</p>
                    <p className="font-inter text-sm text-text-dark">{new Date(lastSeenTime).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-amber/5 border-amber/20">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber flex-shrink-0 mt-0.5" />
                <p className="font-inter text-sm text-text-dark leading-relaxed">
                  This alert will be sent to all pet owners within 10km of your location via push notification.
                </p>
              </div>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                disabled={sending}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleSendAlert}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {sending && <Loader2 size={18} className="animate-spin" />}
                {sending ? 'Sending...' : 'Send Alert'}
              </Button>
            </div>
          </div>
        )}
      </WhiteCard>
    </div>
  )
}
