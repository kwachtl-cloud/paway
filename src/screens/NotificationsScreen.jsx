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
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      <div className="px-6 pt-8 flex items-center justify-between mb-8">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-title text-foreground">{t('notifications')}</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-heading">{t('noNotifications')}</p>
            <p className="text-body mt-2">{t('newUpdates')}</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => navigate(notif.type === 'message' ? 'chat' : 'bookings')}
              className={`card rounded-[var(--radius-md)] p-5 flex items-start gap-4 active:scale-[0.99] transition-transform cursor-pointer border ${
                notif.unread ? 'border-[#D5E5D7]' : 'border-[#EEE7DE]'
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                notif.type === 'booking' ? 'bg-[#EAF4EA]' :
                notif.type === 'message' ? 'bg-[#EEF3F7]' :
                notif.type === 'promo' ? 'bg-[#FFF1D8]' : 'bg-[#F1F0ED]'
              }`}>
                {notif.type === 'booking' && <Calendar size={18} className="text-[#237A4B]" />}
                {notif.type === 'message' && <Bell size={18} className="text-[#356C91]" />}
                {notif.type === 'promo' && <Check size={18} className="text-[#A46B12]" />}
                {notif.type === 'reminder' && <Clock size={18} className="text-[#77716A]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <p className="text-title text-foreground">{notif.title}</p>
                  <span className="text-caption text-muted-foreground whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-body text-muted-foreground leading-relaxed">{notif.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
