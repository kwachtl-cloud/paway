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
      <div className="px-4 pt-4 flex items-center justify-between mb-4">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <h1 className="font-display text-lg font-semibold text-text-dark">{t('notifications')}</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-text-light">
            <Bell size={48} className="text-text-light mx-auto mb-4" />
            <p className="text-lg">{t('noNotifications')}</p>
            <p className="text-sm mt-1">{t('newUpdates')}</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => navigate(notif.type === 'message' ? 'chat' : 'bookings')}
              className={`bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 active:scale-95 transition-transform cursor-pointer ${
                notif.unread ? 'border-l-4 border-l-brand-green border-border-subtle' : 'border border-border-subtle'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-medium text-text-dark text-sm">{notif.title}</p>
                  <span className="text-[10px] text-text-light">{notif.time}</span>
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
