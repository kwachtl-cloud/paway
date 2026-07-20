import { useState, useEffect } from 'react'
import { Search, Bell, ChevronRight, Heart, Star, Dog, Scissors, Stethoscope, Users } from 'lucide-react'
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
        if (user?.uid) {
          const userBookings = await getUserBookings(user.uid)
          setBookings(userBookings)
        }
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
      <div className="px-5 pt-6 pb-24 flex items-center justify-center min-h-screen">
        <p className="text-text-light text-sm">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="font-display text-3xl text-text-dark leading-tight">
            {t('hi')}, {user?.name || 'Anna'} <span className="inline-block">👋</span>
          </p>
          <p className="text-text-light text-sm mt-1.5">{t('howCanWeHelp')}</p>
        </div>
        <button
          onClick={() => navigate('notifications')}
          className="relative w-11 h-11 bg-white rounded-2xl shadow-sm border border-border-subtle flex items-center justify-center active:scale-95 transition-transform"
        >
          <Bell size={19} className="text-text-body" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sos-red rounded-full" />
        </button>
      </div>

      {/* Search Bar */}
      <button
        onClick={() => navigate('search-sitter')}
        className="w-full bg-white rounded-2xl px-4 py-4 shadow-sm border border-border-subtle flex items-center gap-3 mb-7 active:scale-[0.98] transition-transform"
      >
        <Search size={18} className="text-text-light" />
        <span className="text-text-light text-sm flex-1 text-left">{t('searchPlaceholder')}</span>
        <div className="w-7 h-7 bg-beige rounded-lg flex items-center justify-center">
          <span className="text-xs">⚙</span>
        </div>
      </button>

      {/* Quick Actions */}
      <div className="mb-7">
        <h2 className="text-base font-display font-semibold text-text-dark mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ id, icon: Icon, labelKey, color, iconColor, screen }) => (
            <button
              key={id}
              onClick={() => navigate(screen)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-full aspect-square ${color} rounded-2xl flex items-center justify-center`}>
                <Icon size={24} strokeWidth={1.7} className={iconColor} />
              </div>
              <span className="text-[11px] font-medium text-text-body text-center leading-tight whitespace-pre-line">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcomingBooking && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-display font-semibold text-text-dark">{t('upcoming')}</h2>
            <button
              onClick={() => navigate('bookings')}
              className="text-brand-green text-xs font-semibold flex items-center gap-0.5"
            >
              {t('viewAll')} <ChevronRight size={12} />
            </button>
          </div>
          <button
            onClick={() => navigate('bookings')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-4 active:scale-[0.98] transition-transform"
          >
            <img src={upcomingBooking.providerImage || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'} alt="" className="w-14 h-14 rounded-2xl object-cover" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-text-light font-semibold mb-0.5">{t('petSitting')}</p>
              <p className="font-medium text-text-dark text-sm">Tomorrow, 10:00</p>
              <p className="text-xs text-text-light mt-0.5 truncate">with {upcomingBooking.providerName}</p>
            </div>
            <span className="px-2.5 py-1 bg-brand-green/10 text-brand-green text-[10px] font-semibold rounded-full whitespace-nowrap">
              {t(upcomingBooking.status)}
            </span>
          </button>
        </div>
      )}

      {/* Paway Tracker Promo */}
      <button
        onClick={() => navigate('tracker-store')}
        className="relative w-full bg-gradient-to-br from-brand-green to-emerald-700 text-white rounded-3xl p-5 mb-7 flex items-center justify-between overflow-hidden active:scale-[0.98] transition-transform shadow-lg shadow-brand-green/20"
      >
        <div className="text-left relative z-10">
          <p className="font-display text-xl mb-1">{t('pawayTracker')}</p>
          <p className="text-sm text-white/80 max-w-[200px]">{t('gpsSafeZones')}</p>
        </div>
        <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shrink-0">
          <ChevronRight size={20} />
        </div>
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 select-none">🐾</div>
      </button>

      {/* Recommended */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-semibold text-text-dark">{t('recommendedForYou')}</h2>
          <button
            onClick={() => navigate('search-sitter')}
            className="text-brand-green text-xs font-semibold flex items-center gap-0.5"
          >
            {t('viewAll')} <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x scrollbar-hide">
          {providers.slice(0, 3).map((provider) => {
            const match = calculateAIMatch(myPetTags, provider.tags || [])
            return (
              <div
                key={provider.id}
                onClick={() => navigate('provider-profile', { providerId: provider.id })}
                className="min-w-[200px] bg-white rounded-3xl overflow-hidden shadow-sm border border-border-subtle snap-start active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop'} alt={provider.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(provider.id) }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 backdrop-blur rounded-full flex items-center justify-center"
                  >
                    <Heart size={14} className={savedProviders.has(provider.id) ? 'text-red-500 fill-red-500' : 'text-text-light'} />
                  </button>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-text-dark text-sm truncate">{provider.name}</p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs text-text-body font-medium">{provider.rating || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-light truncate">{provider.location?.address || provider.location || 'Location not set'}</p>
                  <p className="text-sm font-semibold text-brand-green mt-1.5">{t('fromPricePerNight').replace('{price}', `$${provider.price || 25}`)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
