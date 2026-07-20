import { useState, useEffect } from 'react'
import { Bell, MapPin, PawPrint, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getSOSAlertsNearby } from '../firebase/services'
import SOSAlertCard from '../components/SOSAlertCard'

export default function HomeScreen() {
  const { t, navigate, user } = useApp()
  const [sosAlerts, setSosAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  
  // Get user location and load nearby alerts
  useEffect(() => {
    if (!user?.uid) return
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
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
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }, [user])

  // MVP Quick Actions - tylko kluczowe funkcjonalności
  const quickActions = [
    { 
      id: 'park-radar', 
      icon: MapPin, 
      labelKey: 'parkRadar', 
      color: 'bg-[#E8F5E9]', 
      iconColor: 'text-[#2E7D32]', 
      screen: 'park-radar',
      description: 'findDogsNearby'
    },
    { 
      id: 'pet-passport', 
      icon: PawPrint, 
      labelKey: 'petPassport', 
      color: 'bg-[#FFF3E0]', 
      iconColor: 'text-[#E65100]', 
      screen: 'pet-passport',
      description: 'managePetProfiles'
    },
  ]

  return (
    <div className="min-h-screen bg-background px-6 pt-6 pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-heading text-foreground">
            {t('hi')}, {user?.name || 'Anna'} 👋
          </h1>
          <p className="text-body text-muted-foreground mt-2">{t('welcomeToPawayMVP')}</p>
        </div>
        <button
          onClick={() => navigate('notifications')}
          className="relative w-12 h-12 bg-card rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <Bell size={20} className="text-foreground" />
        </button>
      </div>

      {/* SOS Emergency Banner */}
      <div className="mb-8">
        <button
          onClick={() => navigate('sos')}
          className="w-full overflow-hidden rounded-[var(--radius-lg)] p-6 text-left bg-gradient-to-br from-destructive to-destructive/80 text-primary-foreground shadow-lg active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle size={26} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg leading-tight font-bold mb-1">{t('sosEmergency')}</p>
              <p className="text-sm opacity-90">{t('lostPetAlert')}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-title text-foreground mb-4">{t('whatDoYouNeed')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map(({ id, icon: Icon, labelKey, color, iconColor, screen, description }) => (
            <button
              key={id}
              onClick={() => navigate(screen)}
              className="card p-6 flex flex-col items-center gap-3 active:scale-95 transition-all hover:shadow-md"
            >
              <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center`}>
                <Icon size={32} className={iconColor} strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">{t(labelKey)}</p>
                <p className="text-xs text-muted-foreground">{t(description)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active SOS Alerts */}
      {sosAlerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title text-foreground flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              {t('activeSOSAlerts')}
            </h2>
            <button 
              onClick={() => navigate('sos-list')}
              className="text-primary text-caption font-semibold"
            >
              {t('viewAll')}
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
            {t('showingAlertsWithin')} 10km
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-2">{t('mvpPhase1')}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('mvpDescription')}
        </p>
      </div>
    </div>
  )
}
