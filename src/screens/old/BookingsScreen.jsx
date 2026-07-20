import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getUserBookings } from '../firebase/services'
import { ChevronRight } from 'lucide-react'

const statusStyles = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
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
      <div className="px-4 pt-6 pb-24 animate-fade-in flex items-center justify-center min-h-screen">
        <p className="text-text-light">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-24 animate-fade-in">
      <h1 className="font-display text-2xl font-semibold text-text-dark mb-5">{t('bookings')}</h1>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 mb-5 shadow-sm border border-border-subtle">
        {['upcoming', 'past'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key ? 'bg-brand-green text-white shadow-sm' : 'text-text-light'
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-light">
          <p className="text-lg">{t('noBookingsYet')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
              <div
                key={booking.id}
                onClick={() => navigate('booking-detail', { providerId: booking.providerId, bookingId: booking.id })}
                className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle active:scale-95 transition-transform cursor-pointer"
              >
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={booking.providerImage || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'} 
                  alt={booking.providerName} 
                  className="w-14 h-14 rounded-xl object-cover" 
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-medium text-text-dark text-sm">{booking.providerName}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${statusStyles[booking.status]}`}>
                      {t(booking.status)}
                    </span>
                  </div>
                  <p className="text-xs text-text-light capitalize">{booking.type} • {booking.petName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-sm text-text-light">
                <span>{booking.date}</span>
                <span>{booking.time}</span>
                <ChevronRight size={16} className="text-text-light" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
