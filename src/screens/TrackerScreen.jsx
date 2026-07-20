import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Battery, Gauge, Route, Flashlight, Shield, Wifi, MapPin } from 'lucide-react'
import { GoogleMap, Marker, Circle, Polyline } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem'
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
}

export default function TrackerScreen() {
  const { t, goBack } = useApp()
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [activePet, setActivePet] = useState(0)

  const pets = [
    { name: 'Buddy', lat: 52.235, lng: 21.015, battery: 87, speed: 3.2, distance: 4.7, color: '#4A5D4E' },
    { name: 'Whiskers', lat: 52.228, lng: 21.008, battery: 62, speed: 0, distance: 1.2, color: '#D4A373' },
  ]

  const pet = pets[activePet]
  const pathCoords = [
    { lat: 52.232, lng: 21.010 },
    { lat: 52.233, lng: 21.012 },
    { lat: 52.234, lng: 21.011 },
    { lat: 52.235, lng: 21.013 },
    { lat: pet.lat, lng: pet.lng },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-4 flex flex-col" style={{ height: '100vh' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold">{t('pawayTracker')}</h1>
        <div className="w-10" />
      </div>

      {/* Pet Selector */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {pets.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePet(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-transform ${
              activePet === i ? 'bg-brand-green text-white' : 'bg-white/10 text-white/70'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activePet === i ? 'bg-white/20' : 'bg-white/10'}`}>
              <MapPin size={12} />
            </div>
            {p.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative bg-gray-800 rounded-3xl overflow-hidden mb-4" style={{ height: '260px' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: pet.lat, lng: pet.lng }}
          zoom={15}
          options={mapOptions}
        >
          <Circle
            center={{ lat: pet.lat, lng: pet.lng }}
            radius={300}
            options={{
              strokeColor: '#27AE60',
              strokeOpacity: 1,
              strokeWeight: 1.5,
              fillColor: '#27AE60',
              fillOpacity: 0.08
            }}
          />
          <Polyline
            path={pathCoords}
            options={{
              strokeColor: '#F39C12',
              strokeOpacity: 0.6,
              strokeWeight: 3
            }}
          />
          <Marker 
            position={{ lat: pet.lat, lng: pet.lng }}
            title={pet.name}
          />
        </GoogleMap>

        {/* Live Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm z-[1000]">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-medium tracking-wide">{t('live')}</span>
        </div>

        {/* Signal */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm z-[1000]">
          <Wifi size={14} className="text-green-400" />
          <span className="text-[10px]">{t('strong')}</span>
        </div>
      </div>

      {/* Dashboard */}
      <div className="bg-gray-800 rounded-3xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-green-400">
              <Battery size={16} />
            </div>
            <p className="text-lg font-bold">{pet.battery}%</p>
            <p className="text-[10px] text-white/50">{t('battery')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-amber-400">
              <Gauge size={16} />
            </div>
            <p className="text-lg font-bold">{pet.speed}</p>
            <p className="text-[10px] text-white/50">{t('speed')} km/h</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1 text-blue-400">
              <Route size={16} />
            </div>
            <p className="text-lg font-bold">{pet.distance}</p>
            <p className="text-[10px] text-white/50">{t('distanceToday')} km</p>
          </div>
        </div>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${
            flashlightOn ? 'bg-amber-400 text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Flashlight size={18} />
          {t('flashlight')}
        </button>
      </div>
    </div>
  )
}
