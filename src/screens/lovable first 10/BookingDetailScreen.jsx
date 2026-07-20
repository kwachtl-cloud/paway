import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getService } from '../firebase/services'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'

export default function BookingDetailScreen() {
  const { t, goBack, navigate, selectedBookingId, selectedProviderId } = useApp()
  const [booking, setBooking] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      if (selectedProviderId) {
        const p = await getService(selectedProviderId)
        if (!cancelled) setProvider(p)
      }
      if (selectedBookingId) {
        const { getDoc, doc } = await import('firebase/firestore')
        const { db } = await import('../firebase/firebase')
        const snap = await getDoc(doc(db, 'bookings', selectedBookingId))
        if (!cancelled && snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() })
        }
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [selectedBookingId, selectedProviderId])

  if (loading) {
    return (
      <div className="px-5 pt-6 pb-24 flex items-center justify-center min-h-screen">
        <p className="text-text-light text-sm">{t('loading')}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="px-5 pt-6 pb-24 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-text-light mb-4">{t('bookingNotFound') || 'Booking not found'}</p>
          <button onClick={goBack} className="px-6 py-3 bg-brand-green text-white rounded-2xl font-medium active:scale-95 transition-transform">
            {t('goBack')}
          </button>
        </div>
      </div>
    )
  }

  const statusBadge =
    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-600'

  return (
    <div className="px-5 pt-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={goBack} className="w-11 h-11 bg-white rounded-2xl border border-border-subtle flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={19} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg text-text-dark">{t('bookingDetails') || 'Booking Details'}</h1>
        <div className="w-11" />
      </div>

      {/* Hero Status */}
      <div className="text-center mb-8">
        <span className={`inline-block px-5 py-2 rounded-full text-sm font-semibold ${statusBadge}`}>
          {t(booking.status) || booking.status}
        </span>
        <p className="font-display text-2xl text-text-dark mt-4">{booking.date}</p>
        <p className="text-text-light text-sm mt-1">at {booking.time}</p>
      </div>

      {/* Info Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-border-subtle mb-5 divide-y divide-border-subtle">
        <div className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-brand-green/10 rounded-2xl flex items-center justify-center">
            <Calendar size={19} className="text-brand-green" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-light font-semibold">{t('date') || 'Date'}</p>
            <p className="font-medium text-text-dark text-sm">{booking.date}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-brand-green/10 rounded-2xl flex items-center justify-center">
            <Clock size={19} className="text-brand-green" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-light font-semibold">{t('time') || 'Time'}</p>
            <p className="font-medium text-text-dark text-sm">{booking.time}</p>
          </div>
        </div>

        {booking.address && (
          <div className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-brand-green/10 rounded-2xl flex items-center justify-center">
              <MapPin size={19} className="text-brand-green" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-light font-semibold">{t('address') || 'Address'}</p>
              <p className="font-medium text-text-dark text-sm">{booking.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Provider Card */}
      {provider && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-border-subtle mb-6">
          <p className="text-[11px] uppercase tracking-wider text-text-light font-semibold mb-3">{t('provider') || 'Provider'}</p>
          <div className="flex items-center gap-3">
            <img
              src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}
              alt={provider.name}
              className="w-14 h-14 rounded-2xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-dark truncate">{provider.name}</p>
              <p className="text-xs text-text-light">{provider.type} {provider.price ? `• $${provider.price}/night` : ''}</p>
            </div>
            <button
              onClick={() => navigate('provider-profile', { providerId: selectedProviderId })}
              className="px-4 py-2 bg-brand-green text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
            >
              {t('viewProfile') || 'View Profile'}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-text-light tracking-wider">
        ID: {booking.id}
      </p>
    </div>
  )
}
