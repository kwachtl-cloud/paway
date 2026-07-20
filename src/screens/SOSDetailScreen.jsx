import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  MessageSquare
} from 'lucide-react'
import { 
  getSOSAlert, 
  reportSighting, 
  markAlertAsViewed,
  resolveSOSAlert 
} from '../firebase/services'

export default function SOSDetailScreen() {
  const { t, goBack, user, selectedAlertId } = useApp()
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSightingForm, setShowSightingForm] = useState(false)
  const [sightingNote, setSightingNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  useEffect(() => {
    if (!selectedAlertId) {
      goBack()
      return
    }
    
    loadAlert()
    
    // Mark as viewed
    if (user?.uid && selectedAlertId) {
      markAlertAsViewed(selectedAlertId, user.uid).catch(err =>
        console.error('Error marking as viewed:', err)
      )
    }
  }, [selectedAlertId, user])
  
  const loadAlert = async () => {
    try {
      setLoading(true)
      const alertData = await getSOSAlert(selectedAlertId)
      setAlert(alertData)
    } catch (error) {
      console.error('Error loading alert:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmitSighting = async () => {
    if (!alert || !user) return
    
    setSubmitting(true)
    try {
      // Get current location for sighting
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await reportSighting(
              alert.id,
              user.uid,
              user.name || 'User',
              pos.coords.latitude,
              pos.coords.longitude,
              sightingNote.trim()
            )
            
            setSubmitted(true)
            setShowSightingForm(false)
            setSightingNote('')
            await loadAlert() // Reload to show new sighting
          },
          (error) => {
            console.error('Location error:', error)
            alert(t('locationRequired'))
          }
        )
      }
    } catch (error) {
      console.error('Error reporting sighting:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  const getTimeAgo = (timestamp) => {
    if (!timestamp?.seconds) return ''
    
    const now = Date.now() / 1000
    const diff = now - timestamp.seconds
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ${t('ago')}`
    if (hours > 0) return `${hours}h ${t('ago')}`
    if (minutes > 0) return `${minutes}min ${t('ago')}`
    return t('justNow')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }
  
  if (!alert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('alertNotFound')}</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={goBack} 
          className="w-10 h-10 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-foreground">{t('sosAlert')}</h1>
      </div>
      
      {/* Success Message */}
      {submitted && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle size={20} />
            <div>
              <p className="font-semibold text-sm">{t('sightingReported')}</p>
              <p className="text-xs">{t('thankYouForHelping')}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pet Card */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-4 mb-4">
          {alert.petPhoto ? (
            <img
              src={alert.petPhoto}
              alt={alert.petName}
              className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 bg-destructive/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={32} className="text-destructive" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground mb-1">{alert.petName}</h2>
            <p className="text-sm text-muted-foreground mb-3">{alert.petBreed || t('pet')}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />
              {t('reported')} {getTimeAgo(alert.createdAt)}
            </div>
          </div>
        </div>
        
        {/* Description */}
        {alert.description && (
          <div className="bg-background rounded-xl p-3 mb-3">
            <p className="text-sm font-semibold text-foreground mb-1">{t('description')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{alert.description}</p>
          </div>
        )}
        
        {/* Location */}
        <div className="bg-background rounded-xl p-3 mb-3">
          <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
            <MapPin size={14} />
            {t('lastSeenLocation')}
          </p>
          <p className="text-sm text-muted-foreground">
            {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}
            {alert.distance && ` (${alert.distance < 1 ? `${Math.round(alert.distance * 1000)}m` : `${alert.distance.toFixed(1)}km`} ${t('away')})`}
          </p>
        </div>
        
        {/* Contact */}
        {alert.contactPhone && (
          <div className="bg-background rounded-xl p-3">
            <p className="text-sm font-semibold text-foreground mb-1">{t('contactOwner')}</p>
            <a
              href={`tel:${alert.contactPhone}`}
              className="flex items-center gap-2 text-primary font-medium"
            >
              <Phone size={16} />
              {alert.contactPhone}
            </a>
          </div>
        )}
      </div>
      
      {/* Actions */}
      {alert.userId !== user?.uid && !showSightingForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowSightingForm(true)}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <CheckCircle size={20} />
            {t('iSawThisPet')}
          </button>
        </div>
      )}
      
      {/* Sighting Form */}
      {showSightingForm && (
        <div className="card p-5 mb-6 animate-slide-up">
          <h3 className="font-semibold text-foreground mb-4">{t('reportSighting')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('additionalNotes')}
              </label>
              <textarea
                rows={3}
                value={sightingNote}
                onChange={(e) => setSightingNote(e.target.value)}
                placeholder={t('describeWhatHappened')}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSightingForm(false)}
                className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold active:scale-95 transition-transform"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSubmitSighting}
                disabled={submitting}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold active:scale-95 transition-transform disabled:opacity-50"
              >
                {submitting ? t('sending') : t('submitSighting')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sightings List */}
      {alert.reportedSightings && alert.reportedSightings.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare size={18} />
            {t('sightingsReported')} ({alert.reportedSightings.length})
          </h3>
          
          <div className="space-y-3">
            {alert.reportedSightings.map((sighting, index) => (
              <div key={index} className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{sighting.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sighting.reportedAt).toLocaleString()}
                  </p>
                </div>
                {sighting.note && (
                  <p className="text-sm text-muted-foreground">{sighting.note}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {sighting.location.lat.toFixed(5)}, {sighting.location.lng.toFixed(5)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
