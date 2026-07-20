import { useState, useMemo, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Search, MapPin, Star, List, Map as MapIcon, Heart, Navigation } from 'lucide-react'
import { getServices } from '../firebase/services'
import { GoogleMap, Marker } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem'
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

export default function SearchScreen() {
  const { t, navigate, currentScreen } = useApp()
  const [view, setView] = useState('list')
  const [query, setQuery] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 52.23, lng: 21.01 })
  const [locationQuery, setLocationQuery] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const searchType = currentScreen === 'search-groomer' ? 'groomer' : currentScreen === 'search-vet' ? 'vet' : 'sitter'

  const titles = { sitter: t('findASitter'), groomer: t('findGroomer').replace('\n', ' '), vet: t('findASitter') }

  useEffect(() => {
    setLoading(true)
    getServices(searchType)
      .then(data => {
        console.log(`Fetched ${data.length} providers for type ${searchType}:`, data)
        setProviders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching providers:', err)
        setLoading(false)
      })
  }, [searchType])

  const toggleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = providers.filter((p) =>
    (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.tags || []).some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  )

  const getProviderPosition = (provider, index) => {
    const lat = provider.location?.lat || provider.lat
    const lng = provider.location?.lng || provider.lng
    if (lat && lng) {
      return { lat, lng }
    }
    const angle = (index * 137.5) * (Math.PI / 180)
    const radius = 0.005 + (index * 0.001)
    return {
      lat: 52.23 + Math.cos(angle) * radius,
      lng: 21.01 + Math.sin(angle) * radius,
    }
  }

  const geocodeLocation = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 2) return
    setLocationLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1&accept-language=pl`
      )
      const data = await response.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newCenter = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setMapCenter(newCenter)
        setLocationQuery('')
      } else {
        alert(t('locationNotFound') || 'Location not found')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      alert('Error searching for location')
    } finally {
      setLocationLoading(false)
    }
  }, [t])

  useEffect(() => {
    setMapReady(false)
    const timer = setTimeout(() => setMapReady(true), 150)
    return () => clearTimeout(timer)
  }, [view])

  return (
    <div className="px-4 pt-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('home')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg font-semibold text-text-dark">{titles[searchType]}</h1>
        <div className="w-10" />
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-14 pr-4 py-3.5 bg-white rounded-2xl border border-border text-sm focus:outline-none focus:border-primary shadow-sm relative z-10"
        />
      </div>

      {/* View Toggle */}
<div className="flex bg-white rounded-2xl p-1 mb-4 shadow-sm border border-border">
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          <List size={16} />
          {t('listView')}
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          <MapIcon size={16} />
          {t('mapView')}
        </button>
      </div>

      {/* Location Search - only visible on map view */}
      {view === 'map' && (
        <div className="relative mb-4">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20">
            <Navigation size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder={t('searchLocation') || 'Search city or location...'}
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                geocodeLocation(locationQuery)
              }
            }}
            className="w-full pl-14 pr-10 py-3.5 bg-white rounded-2xl border border-border text-sm focus:outline-none focus:border-primary shadow-sm relative z-10"
          />
          {locationLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{t('loading')}</p>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {filtered.map((provider) => (
            <div
              key={provider.id}
              onClick={() => navigate('provider-profile', { providerId: provider.id })}
              className="card rounded-[var(--radius-md)] p-4 active:scale-95 transition-transform cursor-pointer flex items-center gap-4"
            >
              {/* Small photo on left */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Details on right */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-semibold text-foreground truncate flex-1">{provider.name}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium">{provider.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                  <MapPin size={11} />
                  <span className="truncate">{provider.location?.address || provider.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-primary font-semibold text-sm">${provider.price}/night</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(provider.id) }}
                    className="w-8 h-8 bg-card/90 rounded-full flex items-center justify-center border border-border"
                  >
                    <Heart size={14} className={savedIds.has(provider.id) ? 'text-destructive fill-destructive' : 'text-muted-foreground'} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height: '450px' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={14}
            options={mapOptions}
          >
            {filtered.map((provider) => {
              const pos = getProviderPosition(provider)
              return (
                <Marker
                  key={provider.id}
                  position={{ lat: pos.lat, lng: pos.lng }}
                  onClick={() => navigate('provider-profile', { providerId: provider.id })}
                  title={`${provider.name} - $${provider.price}`}
                />
              )
            })}
          </GoogleMap>
        </div>
      )}
    </div>
  )
}
