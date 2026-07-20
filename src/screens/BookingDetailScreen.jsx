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
      <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in flex items-center justify-center">
        <p className="text-body text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-muted-foreground mb-6">{t('bookingNotFound') || 'Booking not found'}</p>
          <button onClick={goBack} className="btn btn-primary">
            {t('goBack')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-title text-foreground">{t('bookingDetails') || 'Booking Details'}</h1>
        <div className="w-10" />
      </div>

      <div className="rounded-[var(--radius-lg)] p-5 bg-[image:var(--gradient-primary)] text-primary-foreground shadow-glow mb-6">
        <div className="flex items-center gap-4">
          <img
            src={provider?.image || booking.providerImage || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
            alt={provider?.name || booking.providerName}
            className="w-18 h-18 rounded-[var(--radius-md)] object-cover"
          />
          <div className="flex-1">
            <p className="text-title">{booking.type || t('petSitting')}</p>
            <p className="text-caption opacity-80">With {provider?.name || booking.providerName}</p>
          </div>
          <span className={`badge bg-primary-foreground/20 text-primary-foreground`}>
            {t(booking.status) || booking.status}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-[22px] p-4 shadow-[0_10px_24px_rgba(28,55,45,0.06)] border border-[#EEE7DE] flex items-center gap-4">
          <div className="w-11 h-11 bg-[#F3EEE7] rounded-2xl flex items-center justify-center">
            <Calendar size={20} className="text-foreground" />
          </div>
          <div>
            <p className="text-caption text-muted-foreground">{t('date') || 'Date'}</p>
            <p className="text-title text-foreground">{booking.date}</p>
          </div>
        </div>

        <div className="card rounded-[var(--radius-md)] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center">
            <Clock size={20} className="text-foreground" />
          </div>
          <div>
            <p className="text-caption text-muted-foreground">{t('time') || 'Time'}</p>
            <p className="text-title text-foreground">{booking.time}</p>
          </div>
        </div>

        {booking.address && (
          <div className="bg-white rounded-[22px] p-4 shadow-[0_10px_24px_rgba(28,55,45,0.06)] border border-[#EEE7DE] flex items-center gap-4">
            <div className="w-11 h-11 bg-[#F3EEE7] rounded-2xl flex items-center justify-center">
              <MapPin size={20} className="text-[#173B31]" />
            </div>
            <div>
              <p className="text-xs text-[#8C857C]">{t('address') || 'Address'}</p>
              <p className="font-bold text-[#173B31]">{booking.address}</p>
            </div>
          </div>
        )}
      </div>

      {provider && (
        <div className="bg-white rounded-[24px] p-4 shadow-[0_10px_24px_rgba(28,55,45,0.06)] border border-[#EEE7DE] mb-6">
          <p className="text-xs text-[#8C857C] mb-3">{t('provider') || 'Provider'}</p>
          <div className="flex items-center gap-3">
            <img
              src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'}
              alt={provider.name}
              className="w-14 h-14 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <p className="font-bold text-[#173B31]">{provider.name}</p>
              <p className="text-xs text-[#8C857C]">{provider.type} {provider.price ? `• $${provider.price}/night` : ''}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('provider-profile', { providerId: selectedProviderId })}
            className="w-full mt-4 py-3 bg-[#173B31] text-white rounded-2xl text-sm font-bold active:scale-95 transition-transform"
          >
            {t('viewProfile') || 'View Profile'}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-[#B7AEA4]">
        ID: {booking.id}
      </p>
    </div>
  )
}
