import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react'
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
        .then(data => { setProvider(data); setProviderLoading(false) })
        .catch(err => { console.error('Error fetching provider for booking:', err); setProvider(null); setProviderLoading(false) })
    } else {
      setProviderLoading(false)
    }
  }, [selectedProviderId])

  const dates = ['May 12', 'May 13', 'May 14', 'May 15', 'May 16']
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  if (providerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-light text-sm">Loading provider...</p>
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
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={52} className="text-green-500" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-3xl text-text-dark mb-3 text-center">{t('bookingConfirmed')}</h2>
        <p className="text-text-light text-sm text-center mb-10 max-w-xs leading-relaxed">
          {t('bookingConfirmationMsg')}
        </p>
        <button
          onClick={() => { setStep(1); goBack() }}
          className="w-full max-w-xs bg-brand-green text-white py-4 rounded-2xl font-semibold active:scale-95 transition-transform shadow-lg shadow-brand-green/20"
        >
          {t('backToHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 flex items-center justify-between mb-7">
        <button onClick={goBack} className="w-11 h-11 bg-white rounded-2xl border border-border-subtle flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={19} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg text-text-dark">
          {step === 1 ? t('selectDate') : t('selectTime')}
        </h1>
        <div className="w-11" />
      </div>

      {/* Stepper */}
      <div className="px-5 mb-6 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-brand-green" />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-brand-green' : 'bg-border-subtle'}`} />
      </div>

      {/* Provider Info */}
      <div className="px-5 mb-7">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-border-subtle flex items-center gap-3">
          <img src={provider.image} alt={provider.name} className="w-14 h-14 rounded-2xl object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-dark truncate">{provider.name}</p>
            <p className="text-xs text-text-light">{t('petSitting')} • ${provider.price}/night</p>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="px-5">
          <h3 className="font-display text-base text-text-dark mb-3">{t('chooseDate')}</h3>
          <div className="space-y-2.5">
            {dates.map(date => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setStep(2) }}
                className={`w-full py-4 px-4 rounded-2xl text-left flex items-center justify-between active:scale-[0.98] transition-transform border ${
                  selectedDate === date ? 'bg-brand-green text-white border-brand-green' : 'bg-white border-border-subtle text-text-dark'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} />
                  <span className="font-medium text-sm">{date}</span>
                </div>
                <span className="text-xs opacity-70">{t('available')}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5">
          <h3 className="font-display text-base text-text-dark mb-3">{t('chooseTime').replace('{date}', selectedDate)}</h3>
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {times.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform border ${
                  selectedTime === time ? 'bg-brand-green text-white border-brand-green' : 'bg-white border-border-subtle text-text-dark'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-2xl mb-4">{error}</div>
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
            className="w-full bg-brand-green text-white py-4 rounded-2xl font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-green/20"
          >
            {loading ? t('loading') : t('confirmBooking')}
          </button>
        </div>
      )}
    </div>
  )
}
