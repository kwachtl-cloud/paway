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
      <div className="flex items-center justify-center h-screen bg-[#FBF7F1]">
        <p className="text-[#8C857C] text-sm">Loading provider...</p>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FBF7F1] animate-fade-in">
        <div className="text-center">
          <p className="text-[#8C857C] mb-4">Provider not found</p>
          <button onClick={goBack} className="px-5 py-3 bg-[#173B31] text-white rounded-2xl text-sm font-semibold">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-primary rounded-full flex items-center justify-center shadow-glow">
            <CheckCircle size={62} className="text-primary-foreground" />
          </div>
          <span className="absolute -top-4 -left-5 text-[#8BB985]">✦</span>
          <span className="absolute -right-5 top-8 text-[#F0A24A]">✦</span>
        </div>
        <h2 className="text-heading text-foreground mb-3">{t('bookingConfirmed')}</h2>
        <p className="text-body text-muted-foreground text-center mb-8">
          {t('bookingConfirmationMsg')}
        </p>
        <div className="card w-full p-5 mb-6 flex items-center gap-4">
          <img src={provider.image} alt={provider.name} className="w-16 h-16 rounded-[var(--radius-md)] object-cover" />
          <div className="text-left">
            <p className="text-title text-foreground">{provider.name}</p>
            <p className="text-caption text-muted-foreground">{selectedDate}, {selectedTime}</p>
          </div>
        </div>
        <button
          onClick={() => { setStep(1); goBack() }}
          className="btn btn-primary btn-lg w-full"
        >
          {t('backToHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-title text-foreground">
          {step === 1 ? t('selectDate') : t('selectTime')}
        </h1>
        <div className="w-10" />
      </div>

      <div className="bg-white rounded-[24px] p-3.5 shadow-[0_10px_24px_rgba(28,55,45,0.06)] border border-[#EEE7DE] flex items-center gap-3 mb-6">
        <img src={provider.image} alt={provider.name} className="w-16 h-16 rounded-2xl object-cover" />
        <div>
          <p className="font-bold text-[#173B31]">{provider.name}</p>
          <p className="text-xs text-[#7D766D]">{t('petSitting')} • ${provider.price}/night</p>
        </div>
      </div>

      {step === 1 ? (
        <div>
          <h3 className="font-bold text-[#173B31] text-sm mb-4">{t('chooseDate')}</h3>
          <div className="bg-white rounded-[26px] p-4 border border-[#EEE7DE] shadow-[0_10px_24px_rgba(28,55,45,0.06)] mb-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[#173B31]">May 2024</p>
              <Calendar size={18} className="text-[#8C857C]" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {dates.map(date => (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setStep(2) }}
                  className={`py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-transform ${
                    selectedDate === date ? 'bg-[#173B31] text-white' : 'bg-[#F6F1EA] text-[#173B31]'
                  }`}
                >
                  {date.replace('May ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-bold text-[#173B31] text-sm mb-4">{t('chooseTime').replace('{date}', selectedDate)}</h3>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {times.map(time => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-transform ${
                  selectedTime === time ? 'bg-[#173B31] text-white' : 'bg-white border border-[#EEE7DE] text-[#173B31]'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-2.5 rounded-xl mb-4">{error}</div>
          )}
          <div className="fixed left-0 right-0 bottom-0 px-5 pt-3 pb-6 bg-[#FBF7F1]/95 backdrop-blur">
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
              className="w-full bg-[#173B31] text-white py-4 rounded-[20px] font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('confirmBooking')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
