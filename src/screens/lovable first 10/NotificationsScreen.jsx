import { useApp } from '../context/AppContext'
import { ArrowLeft, Bell, Check, Clock, Calendar } from 'lucide-react'

export default function NotificationsScreen() {
  const { t, goBack, navigate } = useApp()

  const notifications = [
    { id: 1, type: 'booking', title: t('confirmed'), desc: 'Your booking with Olivia is confirmed for tomorrow.', time: '2h ago', unread: true },
    { id: 2, type: 'message', title: t('messages'), desc: 'Daniel sent you a message about your upcoming walk.', time: '5h ago', unread: true },
    { id: 3, type: 'promo', title: t('recommended'), desc: 'Get 20% off your next grooming session!', time: '1d ago', unread: false },
    { id: 4, type: 'reminder', title: t('upcoming'), desc: 'Reminder: Vet appointment with Dr. Ewa on Apr 20.', time: '2d ago', unread: false },
  ]

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-5 pt-6 flex items-center justify-between mb-7">
        <button onClick={goBack} className="w-11 h-11 bg-white rounded-2xl border border-border-subtle flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={19} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg text-text-dark">{t('notifications')}</h1>
        <div className="w-11" />
      </div>

      <div className="px-5 space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-text-light">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-beige flex items-center justify-center">
              <Bell size={26} className="text-text-light" />
            </div>
            <p className="text-base font-medium text-text-dark">{t('noNotifications')}</p>
            <p className="text-sm mt-1">{t('newUpdates')}</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => navigate(notif.type === 'message' ? 'chat' : 'bookings')}
              className={`bg-white rounded-3xl p-4 shadow-sm flex items-start gap-3.5 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden ${
                notif.unread ? 'border border-border-subtle' : 'border border-border-subtle'
              }`}
            >
              {notif.unread && <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-green" />}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                notif.type === 'booking' ? 'bg-green-100' :
                notif.type === 'message' ? 'bg-blue-100' :
                notif.type === 'promo' ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                {notif.type === 'booking' && <Calendar size={18} className="text-green-600" />}
                {notif.type === 'message' && <Bell size={18} className="text-blue-600" />}
                {notif.type === 'promo' && <Check size={18} className="text-amber-600" />}
                {notif.type === 'reminder' && <Clock size={18} className="text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="font-semibold text-text-dark text-sm truncate">{notif.title}</p>
                  <span className="text-[10px] text-text-light shrink-0">{notif.time}</span>
                </div>
                <p className="text-xs text-text-light leading-relaxed">{notif.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
