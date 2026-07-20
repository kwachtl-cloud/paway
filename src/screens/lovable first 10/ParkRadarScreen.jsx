import { useApp } from '../context/AppContext'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { getNearbyDogs } from '../firebase/services'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const dogIcon = (mood) => L.divIcon({
  html: `<div style="position:relative;">
    <div style="width:44px;height:44px;border-radius:50%;border:3px solid ${mood === 'play' ? '#F59E0B' : '#3B82F6'};overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.15);background:white;">
      <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop" style="width:100%;height:100%;object-fit:cover;" />
    </div>
    <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);background:white;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.1);color:#1A1A1A;">Dog</div>
  </div>`,
  className: '',
  iconSize: [44, 56],
  iconAnchor: [22, 56],
})

function MapFix() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
  }, [map])
  return null
}

export default function ParkRadarScreen() {
  const { t, goBack } = useApp()
  const [filter, setFilter] = useState('all')
  const [selectedDog, setSelectedDog] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)

  const centerLat = 52.23
  const centerLng = 21.01

  useEffect(() => {
    setLoading(true)
    getNearbyDogs()
      .then(data => { setDogs(data); setLoading(false) })
      .catch(err => { console.error('Error fetching nearby dogs:', err); setLoading(false) })
  }, [])

  useEffect(() => {
    setTimeout(() => setMapReady(true), 200)
  }, [])

  const filteredDogs = dogs.filter((d) => filter === 'all' ? true : d.mood === filter)

  const dogPositions = useMemo(() => {
    return dogs.map((dog, i) => ({
      id: dog.id,
      lat: dog.lat || centerLat + (Math.sin(i * 2.5) * 0.002),
      lng: dog.lng || centerLng + (Math.cos(i * 1.8) * 0.002)
    }))
  }, [dogs])

  return (
    <div className="min-h-screen bg-cream px-5 pt-6 flex flex-col" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={goBack} className="w-11 h-11 bg-white rounded-2xl border border-border-subtle flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={19} className="text-text-dark" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-lg text-text-dark leading-none">{t('parkRadar')}</h1>
          <p className="text-[10px] text-text-light mt-0.5">{filteredDogs.length} dogs nearby</p>
        </div>
        <div className="w-11" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: t('all') },
          { key: 'play', label: t('wantsToPlay') },
          { key: 'quiet', label: t('quietWalk') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
              filter === key ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-text-light border-border-subtle'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-border-subtle mb-4 shadow-sm" style={{ minHeight: '350px', height: '50vh' }}>
        {mapReady && !loading ? (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 10 }}
            attributionControl={false}
            zoomControl={false}
          >
            <MapFix />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredDogs.map((dog) => {
              const pos = dogPositions.find(p => p.id === dog.id) || { lat: centerLat, lng: centerLng }
              return (
                <Marker
                  key={dog.id}
                  position={[pos.lat, pos.lng]}
                  icon={dogIcon(dog.mood)}
                  eventHandlers={{ click: () => setSelectedDog(dog) }}
                />
              )
            })}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-beige">
            <p className="text-text-light text-sm">{loading ? t('loading') : 'Loading map...'}</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      {selectedDog && (
        <div className="bg-white rounded-3xl p-4 shadow-lg border border-border-subtle animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <img src={selectedDog.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop'} alt={selectedDog.name} className="w-14 h-14 rounded-2xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-dark truncate">{selectedDog.name}</p>
              <p className="text-xs text-text-light">{selectedDog.breed}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
              selectedDog.mood === 'play' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {selectedDog.mood === 'play' ? t('wantsToPlay') : t('quietWalk')}
            </span>
            <span className="text-text-light flex items-center gap-1 text-xs">
              <MapPin size={14} />
              {selectedDog.distance}m
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
