import { useApp } from '../context/AppContext'
import { Bell, Calendar, MessageSquare, Gift, Heart, AlertTriangle, Users } from 'lucide-react'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Card from '../components/Card'

export default function NotificationsScreen() {
  const { t, goBack, navigate } = useApp()

  const notifications = [
    { 
      id: 1, 
      type: 'sos', 
      category: 'SOS',
      title: 'SOS Alert Nearby', 
      desc: 'A lost Golden Retriever was reported 2km from your location.', 
      time: '5m ago', 
      unread: true,
      icon: AlertTriangle,
      color: 'coral'
    },
    { 
      id: 2, 
      type: 'message', 
      category: 'Community',
      title: 'New Message', 
      desc: 'Daniel sent you a message about your upcoming walk.', 
      time: '1h ago', 
      unread: true,
      icon: MessageSquare,
      color: 'blue'
    },
    { 
      id: 3, 
      type: 'health', 
      category: 'Health',
      title: 'Vaccination Reminder', 
      desc: 'Luna\'s annual vaccination is due in 14 days.', 
      time: '3h ago', 
      unread: false,
      icon: Heart,
      color: 'teal'
    },
    { 
      id: 4, 
      type: 'promo', 
      category: 'Promo',
      title: 'Special Offer', 
      desc: 'Get 20% off your next grooming session!', 
      time: '1d ago', 
      unread: false,
      icon: Gift,
      color: 'amber'
    },
    { 
      id: 5, 
      type: 'community', 
      category: 'Community',
      title: 'Park Meetup', 
      desc: 'Join 12 pet owners at Central Park this Saturday at 10 AM.', 
      time: '2d ago', 
      unread: false,
      icon: Users,
      color: 'blue'
    },
    { 
      id: 6, 
      type: 'booking', 
      category: 'Booking',
      title: 'Booking Confirmed', 
      desc: 'Your booking with Olivia is confirmed for tomorrow at 3 PM.', 
      time: '2d ago', 
      unread: false,
      icon: Calendar,
      color: 'teal'
    },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      <DarkHeader 
        title="Notifications"
        onBack={goBack}
      >
        <div className="px-4 pb-4 pt-2 text-center">
          <p className="font-inter text-sm text-text-gray">
            {unreadCount > 0 
              ? `${unreadCount} new ${unreadCount === 1 ? 'notification' : 'notifications'}`
              : 'All caught up!'}
          </p>
        </div>
      </DarkHeader>

      <WhiteCard>
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-lime-1/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell size={32} className="text-lime-2" />
            </div>
            <h3 className="font-poppins font-semibold text-lg text-text-dark mb-2">
              No Notifications
            </h3>
            <p className="font-inter text-sm text-text-gray max-w-xs mx-auto">
              We'll let you know when something important happens
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => {
              const Icon = notif.icon
              const colorClasses = {
                coral: 'bg-coral/10 text-coral border-coral/20',
                blue: 'bg-blue-1/10 text-blue-1 border-blue-1/20',
                teal: 'bg-teal/10 text-teal border-teal/20',
                amber: 'bg-amber/10 text-amber border-amber/20',
                lime: 'bg-lime-1/10 text-lime-2 border-lime-1/20'
              }
              
              return (
                <Card
                  key={notif.id}
                  onClick={() => {
                    if (notif.type === 'message') navigate('messages')
                    else if (notif.type === 'sos') navigate('sos')
                    else if (notif.type === 'health') navigate('pet-passport')
                    else if (notif.type === 'booking') navigate('bookings')
                  }}
                  className={`cursor-pointer transition-all ${
                    notif.unread 
                      ? 'border-lime-2 border-2 hover:shadow-md' 
                      : 'hover:border-lime-1'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClasses[notif.color]}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <p className={`font-poppins text-sm ${notif.unread ? 'font-bold text-text-dark' : 'font-semibold text-text-dark'}`}>
                            {notif.title}
                          </p>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-lime-gradient rounded-full"></span>
                          )}
                        </div>
                        <span className="font-inter text-[10px] text-text-faint whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="font-inter text-xs text-text-gray leading-relaxed mb-2">
                        {notif.desc}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-inter text-[10px] font-semibold ${colorClasses[notif.color]}`}>
                        {notif.category}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </WhiteCard>
    </div>
  )
}
