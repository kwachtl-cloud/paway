import { useApp } from '../context/AppContext'
import { mockMessages } from '../data/mockData'

export default function MessagesScreen() {
  const { t, navigate } = useApp()

  return (
    <div className="px-4 pt-6 pb-24 animate-fade-in">
      <h1 className="font-display text-2xl font-semibold text-text-dark mb-5">{t('messages')}</h1>

      {mockMessages.length === 0 ? (
        <div className="text-center py-16 text-text-light">
          <p className="text-lg">{t('noMessagesYet')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => navigate('chat', { conversationId: msg.id })}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border-subtle flex items-center gap-3 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="relative">
                <img src={msg.providerImage} alt={msg.providerName} className="w-14 h-14 rounded-full object-cover" />
                {msg.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {msg.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className={`text-sm ${msg.unread > 0 ? 'font-semibold text-text-dark' : 'font-medium text-text-body'}`}>{msg.providerName}</p>
                  <span className="text-xs text-text-light">{msg.timestamp}</span>
                </div>
                <p className={`text-sm truncate ${msg.unread > 0 ? 'text-text-dark font-medium' : 'text-text-light'}`}>
                  {msg.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
