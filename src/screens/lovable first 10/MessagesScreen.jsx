import { useApp } from '../context/AppContext'
import { mockMessages } from '../data/mockData'
import { MessageCircle } from 'lucide-react'

export default function MessagesScreen() {
  const { t, navigate } = useApp()

  return (
    <div className="px-5 pt-6 pb-24 animate-fade-in">
      <h1 className="font-display text-3xl text-text-dark mb-1">{t('messages')}</h1>
      <p className="text-text-light text-sm mb-6">Chat with your providers</p>

      {mockMessages.length === 0 ? (
        <div className="text-center py-20 text-text-light">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-beige flex items-center justify-center">
            <MessageCircle size={26} className="text-text-light" />
          </div>
          <p className="text-base font-medium text-text-dark">{t('noMessagesYet')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => navigate('chat', { conversationId: msg.id })}
              className="bg-white rounded-3xl p-4 shadow-sm border border-border-subtle flex items-center gap-3.5 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="relative shrink-0">
                <img src={msg.providerImage} alt={msg.providerName} className="w-14 h-14 rounded-2xl object-cover" />
                {msg.unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {msg.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5 gap-2">
                  <p className={`text-sm truncate ${msg.unread > 0 ? 'font-semibold text-text-dark' : 'font-medium text-text-body'}`}>{msg.providerName}</p>
                  <span className="text-[11px] text-text-light shrink-0">{msg.timestamp}</span>
                </div>
                <p className={`text-xs truncate ${msg.unread > 0 ? 'text-text-dark font-medium' : 'text-text-light'}`}>
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
