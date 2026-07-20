import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getService } from '../firebase/services'
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react'

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
      <div className="px-4 pt-6 pb-24 animate-fade-in flex items-center justify-center min-h-screen">
        <p className="text-text-light">{t('loading')}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="px-4 pt-6 pb-24 animate-fade-in flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-text-light mb-4">{t('bookingNotFound') || 'Booking not found'}</p>
          <button onClick={goBack} className="px-6 py-3 bg-brand-green text-white rounded-2xl font-medium active:scale-95 transition-transform">
            {t('goBack')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <h1 className="font-display text-xl font-semibold text-text-dark">{t('bookingDetails') || 'Booking Details'}</h1>
        <div className="w-10" />
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {t(booking.status) || booking.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="space-y-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-text-light">{t('date') || 'Date'}</p>
            <p className="font-medium text-text-dark">{booking.date}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-brand-green" />
          </div>
          <div>
            <p className="text-xs text-text-light">{t('time') || 'Time'}</p>
            <p className="font-medium text-text-dark">{booking.time}</p>
          </div>
        </div>

        {booking.address && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-brand-green" />
            </div>
            <div>
              <p className="text-xs text-text-light">{t('address') || 'Address'}</p>
              <p className="font-medium text-text-dark">{booking.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Provider Card */}
      {provider && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle mb-6">
          <p className="text-xs text-text-light mb-3">{t('provider') || 'Provider'}</p>
          <div className="flex items-center gap-3">
            <img
              src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}
              alt={provider.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-text-dark">{provider.name}</p>
              <p className="text-xs text-text-light">{provider.type} {provider.price ? `• $${provider.price}/night` : ''}</p>
            </div>
            <button
              onClick={() => navigate('provider-profile', { providerId: selectedProviderId })}
              className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              {t('viewProfile') || 'View Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Booking ID */}
      <p className="text-center text-xs text-text-light">
        ID: {booking.id}
      </p>
    </div>
  )
}
