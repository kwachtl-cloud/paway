import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import { createBooking, getService } from '../firebase/services'

export default function BookingScreen() {
  const { t, goBack, selectedProviderId, user } = useApp()
  const [provider, setProvider] = useState(null)
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [providerLoading, setProviderLoading] = useState(true)

  useEffect(() => {
    if (selectedProviderId) {
      setProviderLoading(true)
      getService(selectedProviderId)
        .then(data => {
          setProvider(data)
          setProviderLoading(false)
        })
        .catch(err => {
          console.error('Error fetching provider for booking:', err)
          setProvider(null)
          setProviderLoading(false)
        })
    } else {
      setProviderLoading(false)
    }
  }, [selectedProviderId])

  const dates = ['May 12', 'May 13', 'May 14', 'May 15', 'May 16']
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  if (providerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-light">Loading provider...</p>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-screen animate-fade-in">
        <div className="text-center">
          <p className="text-text-light mb-4">Provider not found</p>
          <button onClick={goBack} className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-text-dark mb-2">{t('bookingConfirmed')}</h2>
        <p className="text-text-light text-sm text-center mb-8">
          {t('bookingConfirmationMsg')}
        </p>
        <button
          onClick={() => { setStep(1); goBack() }}
          className="w-full bg-brand-green text-white py-4 rounded-2xl font-medium active:scale-95 transition-transform"
        >
          {t('backToHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-4 flex items-center justify-between mb-6">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg font-semibold text-text-dark">
          {step === 1 ? t('selectDate') : t('selectTime')}
        </h1>
        <div className="w-10" />
      </div>

      {/* Provider Info */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-3">
          <img src={provider.image} alt={provider.name} className="w-14 h-14 rounded-xl object-cover" />
          <div>
            <p className="font-medium text-text-dark">{provider.name}</p>
            <p className="text-xs text-text-light">{t('petSitting')} • ${provider.price}/night</p>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="px-4">
          <h3 className="font-medium text-text-dark text-sm mb-3">{t('chooseDate')}</h3>
          <div className="space-y-2">
            {dates.map(date => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setStep(2) }}
                className={`w-full py-3 px-4 rounded-xl text-left flex items-center justify-between active:scale-95 transition-transform ${
                  selectedDate === date ? 'bg-brand-green text-white' : 'bg-white border border-border-subtle text-text-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <span className="font-medium">{date}</span>
                </div>
                <span className="text-xs opacity-70">{t('available')}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4">
          <h3 className="font-medium text-text-dark text-sm mb-3">{t('chooseTime').replace('{date}', selectedDate)}</h3>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {times.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform ${
                  selectedTime === time ? 'bg-brand-green text-white' : 'bg-white border border-border-subtle text-text-dark'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-2.5 rounded-xl mb-4">{error}</div>
          )}
          <button
            onClick={async () => {
              if (!selectedTime || !user) return
              setLoading(true)
              setError('')
              try {
                await createBooking({
                  user_uid: user.uid,
                  providerId: provider.id,
                  providerName: provider.name,
                  providerImage: provider.image,
                  date: selectedDate,
                  time: selectedTime,
                  price: provider.price,
                  petName: 'Pet',
                })
                setStep(3)
              } catch (err) {
                setError(err.message || 'Failed to book')
              } finally {
                setLoading(false)
              }
            }}
            disabled={!selectedTime || loading}
            className="w-full bg-brand-green text-white py-4 rounded-2xl font-medium active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : t('confirmBooking')}
          </button>
        </div>
      )}
    </div>
  )
}
