import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getUserBookings } from '../firebase/services'
import { ChevronRight } from 'lucide-react'

const statusStyles = {
  confirmed: 'badge-live',
  pending: 'badge-hot',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'badge-beta',
}

export default function BookingsScreen() {
  const { t, navigate, user } = useApp()
  const [tab, setTab] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      setLoading(true)
      getUserBookings(user.uid)
        .then(data => {
          setBookings(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching bookings:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  const filtered = bookings.filter((b) =>
    tab === 'upcoming' ? ['confirmed', 'pending'].includes(b.status) : ['completed', 'cancelled'].includes(b.status)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6 pb-28 animate-fade-in flex items-center justify-center">
        <p className="text-body text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in">
      <h1 className="text-heading text-foreground mb-8">{t('bookings')}</h1>

      <div className="flex bg-card rounded-full p-1 mb-8 shadow-md border border-border">
        {['upcoming', 'past'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-full text-body font-semibold transition-all ${
              tab === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-heading">{t('noBookingsYet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate('booking-detail', { providerId: booking.providerId, bookingId: booking.id })}
              className="card rounded-[var(--radius-md)] p-3.5 active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={booking.providerImage || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
                  alt={booking.providerName}
                  className="w-16 h-16 rounded-[var(--radius-md)] object-cover"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-title text-foreground truncate">{booking.type || t('petSitting')}</p>
                    <span className={`badge ${statusStyles[booking.status]}`}>
                      {t(booking.status)}
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">With {booking.providerName}</p>
                  <p className="text-caption text-muted-foreground mt-0.5">{booking.date}, {booking.time}</p>
                  <p className="text-caption text-muted-foreground mt-0.5 capitalize">{booking.petName}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
