import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Send } from 'lucide-react'
import { mockMessages } from '../data/mockData'

export default function ChatScreen() {
  const { t, goBack, selectedProviderId } = useApp()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! Just confirming our booking for tomorrow.', sender: 'provider', time: '10:30' },
    { id: 2, text: 'Yes, that works perfectly! See you then.', sender: 'user', time: '10:32' },
    { id: 3, text: 'Buddy had a great walk today! 🐕', sender: 'provider', time: '14:32' },
  ])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { id: Date.now(), text: message, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setMessage('')
  }

  const chat = mockMessages.find(m => m.providerId === selectedProviderId) || mockMessages[0]

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-border-subtle flex items-center gap-3">
        <button onClick={goBack} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft size={20} className="text-text-dark" />
        </button>
        <img src={chat.providerImage} alt={chat.providerName} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-medium text-text-dark text-sm">{chat.providerName}</p>
          <p className="text-xs text-green-500">{t('online')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
              msg.sender === 'user'
                ? 'bg-brand-green text-white rounded-br-md'
                : 'bg-white text-text-dark rounded-bl-md shadow-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-text-light'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-border-subtle flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('typeMessage')}
          className="flex-1 px-4 py-2.5 bg-beige rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
