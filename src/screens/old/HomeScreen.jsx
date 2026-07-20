import { useState, useEffect } from 'react'
import { Search, Bell, ChevronRight, Heart, MapPin, Star, Dog, Scissors, Stethoscope, Users, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getServices, getUserBookings } from '../firebase/services'
import { calculateAIMatch } from '../utils/aiMatch'

const myPetTags = ['anxious dog', 'active']

export default function HomeScreen() {
  const { t, navigate, user } = useApp()
  const [savedProviders, setSavedProviders] = useState(new Set())
  const [bookings, setBookings] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    const fetchData = async () => {
      try {
        // Fetch bookings
        if (user?.uid) {
          const userBookings = await getUserBookings(user.uid)
          setBookings(userBookings)
        }
        
        // Fetch providers for recommendations
        const allProviders = await getServices('sitter')
        setProviders(allProviders)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const toggleSave = (id) => {
    setSavedProviders(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const quickActions = [
    { id: 'sitter', icon: Dog, labelKey: 'findPetSitter', color: 'bg-brand-green/10', iconColor: 'text-brand-green', screen: 'category' },
    { id: 'groomer', icon: Scissors, labelKey: 'findGroomer', color: 'bg-groomer-accent/10', iconColor: 'text-groomer-accent', screen: 'search-groomer' },
    { id: 'vet', icon: Stethoscope, labelKey: 'findVet', color: 'bg-vet-accent/10', iconColor: 'text-vet-accent', screen: 'search-vet' },
    { id: 'community', icon: Users, labelKey: 'community', color: 'bg-emerald-500/10', iconColor: 'text-emerald-500', screen: 'park-radar' },
  ]

  const upcomingBooking = bookings.find(b => ['confirmed', 'pending'].includes(b.status))

  if (loading) {
    return (
      <div className="px-4 pt-4 pb-24 animate-fade-in flex items-center justify-center min-h-screen">
        <p className="text-text-light">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-display text-2xl font-semibold text-text-dark">
            {t('hi')}, {user?.name || 'Anna'} 👋
          </p>
          <p className="text-text-light text-sm mt-0.5">{t('howCanWeHelp')}</p>
        </div>
        <button
          onClick={() => navigate('notifications')}
          className="relative w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center active:scale-95 transition-transform"
        >
          <Bell size={20} className="text-text-body" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sos-red rounded-full border-2 border-bg-primary" />
        </button>
      </div>

      {/* Search Bar */}
      <button
        onClick={() => navigate('search-sitter')}
        className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-border-subtle flex items-center gap-3 mb-6 active:scale-95 transition-transform"
      >
        <Search size={18} className="text-text-light" />
        <span className="text-text-light text-sm flex-1 text-left">{t('searchPlaceholder')}</span>
        <div className="w-8 h-8 bg-bg-secondary rounded-lg flex items-center justify-center">
          <span className="text-xs">⚙</span>
        </div>
      </button>

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-dark">{t('quickActions')}</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ id, icon: Icon, labelKey, color, iconColor, screen }) => (
            <button
              key={id}
              onClick={() => navigate(screen)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <Icon size={22} className={iconColor} />
              </div>
              <span className="text-[11px] text-text-body text-center leading-tight whitespace-pre-line">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcomingBooking && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-dark">{t('upcoming')}</h2>
            <button
              onClick={() => navigate('bookings')}
              className="text-brand-green text-xs font-medium"
            >
              {t('viewAll')}
            </button>
          </div>
          <button
            onClick={() => navigate('bookings')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-3 active:scale-95 transition-transform"
          >
            <img src={upcomingBooking.providerImage || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'} alt="" className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs text-text-light mb-0.5">{t('petSitting')}</p>
              <p className="font-medium text-text-dark text-sm">Tomorrow, 10:00</p>
              <p className="text-xs text-text-light mt-0.5">with {upcomingBooking.providerName}</p>
              <p className="text-xs text-text-light">{upcomingBooking.petName && `${upcomingBooking.duration} • ${upcomingBooking.petName}`}</p>
            </div>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
              {t(upcomingBooking.status)}
            </span>
          </button>
        </div>
      )}

      {/* Paway Tracker Promo */}
      <button
        onClick={() => navigate('tracker-store')}
        className="w-full bg-gradient-to-r from-brand-green to-emerald-600 text-white rounded-2xl p-4 mb-6 flex items-center justify-between active:scale-95 transition-transform"
      >
        <div>
          <p className="font-semibold text-lg">{t('pawayTracker')}</p>
          <p className="text-sm text-white/80">{t('gpsSafeZones')}</p>
        </div>
        <ChevronRight size={20} />
      </button>

      {/* Recommended */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-dark">{t('recommendedForYou')}</h2>
          <button
            onClick={() => navigate('search-sitter')}
            className="text-brand-green text-xs font-medium"
          >
            {t('viewAll')}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
          {providers.slice(0, 3).map((provider) => {
            const match = calculateAIMatch(myPetTags, provider.tags || [])
            return (
              <div
                key={provider.id}
                onClick={() => navigate('provider-profile', { providerId: provider.id })}
                className="min-w-[180px] bg-white rounded-2xl overflow-hidden shadow-sm border border-border-subtle snap-start active:scale-95 transition-transform cursor-pointer"
              >
                <div className="relative h-28 overflow-hidden">
                  <img src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop'} alt={provider.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(provider.id) }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center"
                  >
                    <Heart size={14} className={savedProviders.has(provider.id) ? 'text-red-500 fill-red-500' : 'text-text-light'} />
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="font-medium text-text-dark text-sm">{provider.name}</p>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-text-body">{provider.rating || 0}</span>
                  </div>
                  <p className="text-xs text-text-light">{provider.location?.address || provider.location || 'Location not set'}</p>
                  <p className="text-sm font-semibold text-brand-green mt-1">{t('fromPricePerNight').replace('{price}', `$${provider.price || 25}`)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
