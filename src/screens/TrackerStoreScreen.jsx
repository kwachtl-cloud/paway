import { useApp } from '../context/AppContext'
import { ArrowLeft, ShoppingCart, ChevronRight, Zap, Battery, Wifi, Shield, MapPin, Navigation } from 'lucide-react'
import { useState } from 'react'

export default function TrackerStoreScreen() {
  const { t, goBack, navigate } = useApp()
  const [selectedTracker, setSelectedTracker] = useState(null)

  const trackers = [
    {
      id: 't1',
      name: 'Paway Tracker Mini',
      desc: 'Compact GPS tracker for small & medium dogs. Real-time location, safe zones, activity monitoring.',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1583337130417-13104dec14c3?w=200&h=200&fit=crop',
      features: [t('realTimeGps'), '7-day battery', 'Waterproof IP67', t('safeZonesLabel')],
      color: 'bg-brand-green/10',
      popular: false,
    },
    {
      id: 't2',
      name: 'Paway Tracker Pro',
      desc: 'Advanced tracker with live map, history playback, and LED flashlight. Perfect for active dogs.',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop',
      features: [t('realTimeGps') + ' + History', '14-day battery', 'Waterproof IP68', 'LED flashlight', 'Temperature sensor'],
      color: 'bg-amber-400/10',
      popular: true,
    },
    {
      id: 't3',
      name: 'Paway Tracker Lite',
      desc: 'Budget-friendly tracker with essential features. Great for indoor/outdoor monitoring.',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
      features: ['GPS tracking', '5-day battery', 'Water-resistant', 'Activity tracking'],
      color: 'bg-blue-500/10',
      popular: false,
    },
  ]

  if (selectedTracker) {
    return (
      <div className="pb-24 animate-fade-in">
        <div className="px-4 pt-4 flex items-center justify-between mb-4">
          <button onClick={() => setSelectedTracker(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-text-dark" />
          </button>
          <h1 className="font-display text-lg font-semibold text-text-dark">{t('trackerDetails')}</h1>
          <div className="w-10" />
        </div>

        <div className="px-4">
          <div className="bg-beige rounded-3xl p-8 flex items-center justify-center mb-6">
            <img src={selectedTracker.image} alt={selectedTracker.name} className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
          </div>

          <h2 className="font-display text-2xl font-semibold text-text-dark mb-2">{selectedTracker.name}</h2>
          <p className="text-text-light text-sm leading-relaxed mb-6">{selectedTracker.desc}</p>

          <div className="bg-white rounded-2xl border border-border-subtle p-4 mb-6">
            <h3 className="font-medium text-text-dark text-sm mb-3">{t('whatsIncluded')}</h3>
            <div className="space-y-2">
              {selectedTracker.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-brand-green/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-brand-green rounded-full" />
                  </div>
                  <span className="text-sm text-text-body">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-text-dark">${selectedTracker.price}</span>
            <span className="text-text-light text-sm">{t('freeShipping')}</span>
          </div>

          <button
            onClick={() => navigate('tracker')}
            className="w-full bg-brand-green text-white py-4 rounded-2xl font-medium active:scale-95 transition-transform shadow-lg shadow-brand-green/20 mb-3"
          >
            {t('orderNow').replace('{price}', `$${selectedTracker.price}`)}
          </button>
          <button
            onClick={() => setSelectedTracker(null)}
            className="w-full text-text-light text-sm py-3"
          >
            {t('backToStore')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-4 flex items-center justify-between mb-4">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg font-semibold text-text-dark">{t('pawayTrackers')}</h1>
        <div className="w-10" />
      </div>

      {/* Hero */}
      <div className="mx-4 mb-6 bg-gradient-to-br from-brand-green to-emerald-600 rounded-3xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Navigation size={24} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">{t('neverLosePet')}</h2>
            <p className="text-white/80 text-sm">{t('realTimeGpsTracking')}</p>
          </div>
        </div>
        <p className="text-white/70 text-xs leading-relaxed">
          {t('clipOnTrackersDesc')}
        </p>
      </div>

      {/* Tracker List */}
      <div className="px-4 space-y-4">
        {trackers.map(tracker => (
          <div
            key={tracker.id}
            onClick={() => setSelectedTracker(tracker)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border-subtle active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex p-4 gap-4">
              <div className={`w-20 h-20 ${tracker.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <img src={tracker.image} alt={tracker.name} className="w-16 h-16 rounded-xl object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-text-dark text-sm">{tracker.name}</h3>
                  {tracker.popular && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">{t('popular')}</span>
                  )}
                </div>
                <p className="text-xs text-text-light line-clamp-2 mb-2">{tracker.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-green font-bold">${tracker.price}</span>
                  <ChevronRight size={16} className="text-text-light" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="px-4 mt-6">
        <h3 className="font-medium text-text-dark text-sm mb-3">{t('whyPawayTracker')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: t('realTimeGps'), desc: t('updatedEvery10s') },
            { icon: Battery, label: t('longBattery'), desc: t('upTo14Days') },
            { icon: Wifi, label: t('alwaysConnected'), desc: t('_4gBluetooth') },
            { icon: Shield, label: t('safeZonesLabel'), desc: t('instantAlerts') },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-border-subtle">
              <Icon size={20} className="text-brand-green mb-2" />
              <p className="text-sm font-medium text-text-dark">{label}</p>
              <p className="text-xs text-text-light">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
