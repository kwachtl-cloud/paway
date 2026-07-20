import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { AlertTriangle, ArrowLeft, CheckCircle, MapPin, Loader2, Phone, MessageSquare } from 'lucide-react'
import { sendSOSAlert, updateUserLocation } from '../firebase/services'
import { getPets } from '../firebase/services'
import { getCurrentPosition } from '../utils/geolocation'

export default function SOSScreen() {
  const { t, goBack, user } = useApp()
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
      <div className="min-h-screen bg-sos-red text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sos-red text-white px-4 pt-6 pb-8 flex flex-col">
      <button 
        onClick={goBack} 
        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center active:scale-95 transition-transform self-start mb-6"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Step 4: Success */}
      {sent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('alertSentTitle')}</h2>
          <p className="text-white/80 text-sm mb-2">
            {t('alertSent').replace('{count}', nearbyCount || 0)}
          </p>
          <p className="text-white/60 text-xs max-w-[280px] leading-relaxed">
            {t('sosAlertSentDescription')}
          </p>
          
          <button
            onClick={goBack}
            className="mt-8 px-8 py-3 bg-white text-sos-red rounded-xl font-semibold active:scale-95 transition-transform"
          >
            {t('backToHome')}
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <AlertTriangle size={48} />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('sosEmergency')}</h1>
            <p className="text-white/80 text-sm">{t('reportLostPet')}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className={`h-1 rounded-full transition-all ${
                  s === step ? 'w-12 bg-white' : 
                  s < step ? 'w-6 bg-white/80' : 'w-6 bg-white/30'
                }`}
              />
            ))}
          </div>

          <div className="flex-1">
            {/* Step 1: Select Pet */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="font-semibold text-lg mb-4">{t('selectPet')}</h3>
                
                {pets.length === 0 ? (
                  <div className="bg-white/10 rounded-2xl p-6 text-center">
                    <p className="text-white/80 text-sm mb-4">{t('noPetsAddedYet')}</p>
                    <button
                      onClick={() => {/* Navigate to Pet Passport */}}
                      className="text-white font-semibold underline"
                    >
                      {t('addPetFirst')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pets.map(pet => (
                      <button
                        key={pet.id}
                        onClick={() => {
                          setSelectedPet(pet)
                          setStep(2)
                        }}
                        className={`w-full bg-white/10 hover:bg-white/20 rounded-2xl p-4 flex items-center gap-4 transition-colors active:scale-95 ${
                          selectedPet?.id === pet.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        {pet.photos?.[0] ? (
                          <img
                            src={pet.photos[0]}
                            alt={pet.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-semibold">{pet.name}</p>
                          <p className="text-sm text-white/70">{pet.breed || pet.species}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && selectedPet && (
              <div className="animate-fade-in space-y-4">
                <h3 className="font-semibold text-lg mb-4">{t('alertDetails')}</h3>
                
                {/* Selected Pet Card */}
                <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3 mb-4">
                  {selectedPet.photos?.[0] ? (
                    <img
                      src={selectedPet.photos[0]}
                      alt={selectedPet.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={24} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{selectedPet.name}</p>
                    <p className="text-sm text-white/70">{selectedPet.breed || selectedPet.species}</p>
                  </div>
                </div>

                {/* Last Seen Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('lastSeenWhen')}</label>
                  <input
                    type="datetime-local"
                    value={lastSeenTime}
                    onChange={(e) => setLastSeenTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-xl border border-white/20 focus:outline-none focus:border-white/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('whatHappened')}</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('describeWhatHappened')}
                    maxLength={200}
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-xl border border-white/20 focus:outline-none focus:border-white/50 resize-none"
                  />
                  <p className="text-xs text-white/50 mt-1">{description.length}/200</p>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone size={14} className="inline mr-1" />
                    {t('contactPhone')}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-xl border border-white/20 focus:outline-none focus:border-white/50"
                  />
                </div>

                {/* Location Info */}
                {location && (
                  <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="text-xs">{t('currentLocationDetected')}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-white/20 rounded-xl font-semibold active:scale-95 transition-transform"
                  >
                    {t('back')}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-white text-sos-red rounded-xl font-semibold active:scale-95 transition-transform"
                  >
                    {t('continue')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && selectedPet && (
              <div className="animate-fade-in">
                <h3 className="font-semibold text-lg mb-4">{t('confirmAlert')}</h3>
                
                <div className="bg-white/10 rounded-2xl p-5 mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedPet.photos?.[0] && (
                      <img
                        src={selectedPet.photos[0]}
                        alt={selectedPet.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-lg">{selectedPet.name}</p>
                      <p className="text-sm text-white/70">{selectedPet.breed || selectedPet.species}</p>
                    </div>
                  </div>
                  
                  {description && (
                    <div className="pt-3 border-t border-white/20">
                      <p className="text-xs text-white/60 mb-1">{t('description')}</p>
                      <p className="text-sm">{description}</p>
                    </div>
                  )}
                  
                  {contactPhone && (
                    <div className="pt-3 border-t border-white/20">
                      <p className="text-xs text-white/60 mb-1">{t('contactPhone')}</p>
                      <p className="text-sm font-mono">{contactPhone}</p>
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-white leading-relaxed">
                    {t('alertWillBeSent')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={sending}
                    className="flex-1 py-3 bg-white/20 rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {t('back')}
                  </button>
                  <button
                    onClick={handleSendAlert}
                    disabled={sending}
                    className="flex-1 py-3 bg-white text-sos-red rounded-xl font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sending && <Loader2 size={18} className="animate-spin" />}
                    {sending ? t('sending') : t('sendAlert')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
