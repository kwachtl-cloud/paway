import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Send } from 'lucide-react'
import {
  subscribeToMessages,
  sendMessage,
  getOrCreateConversation,
  markConversationRead,
  getUserProfile,
  subscribeToConversation,
} from '../firebase/services'

export default function ChatScreen() {
  const { t, goBack, navigate, selectedConversationId, selectedProviderId, user } = useApp()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [otherProfile, setOtherProfile] = useState(null)
  const [conversation, setConversation] = useState(null)
  const messagesEndRef = useRef(null)

  const otherId = conversation?.participants?.find((id) => id !== user?.uid)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set up conversation
  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!user?.uid) return

      if (selectedConversationId) {
        setLoading(false)
        return
      }

      if (selectedProviderId && user?.uid) {
        const otherDetails = { name: selectedProviderId }
        try {
          const profile = await getUserProfile(selectedProviderId)
          if (profile) {
            otherDetails.name = profile.name
            otherDetails.image = profile.image
            otherDetails.role = profile.role
          }
        } catch {}
        const convId = await getOrCreateConversation(user.uid, selectedProviderId, otherDetails)
        if (!cancelled) {
          navigate('chat', { conversationId: convId })
        }
      }
    }
    init()
    return () => { cancelled = true }
  }, [selectedConversationId, selectedProviderId, user])

  // Subscribe to conversation data
  useEffect(() => {
    if (!selectedConversationId) return
    const unsub = subscribeToConversation(selectedConversationId, (data) => {
      setConversation(data)
    })
    return () => unsub()
  }, [selectedConversationId])

  // Load other participant profile
  useEffect(() => {
    if (otherId) {
      getUserProfile(otherId).then(setOtherProfile)
    }
  }, [otherId])

  // Subscribe to messages
  useEffect(() => {
    if (!selectedConversationId) return
    setLoading(true)
    const unsub = subscribeToMessages(selectedConversationId, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return () => unsub()
  }, [selectedConversationId])

  // Mark as read when viewing
  useEffect(() => {
    if (selectedConversationId && user?.uid) {
      markConversationRead(selectedConversationId, user.uid).catch(() => {})
    }
  }, [selectedConversationId, user])

  const handleSend = async () => {
    if (!text.trim() || !selectedConversationId || !user?.uid) return
    const msg = text.trim()
    setText('')
    try {
      await sendMessage(selectedConversationId, user.uid, user.name || 'User', msg)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const otherData = conversation?.participantDetails?.[otherId]
  const otherName = otherData?.name || otherProfile?.name || 'Unknown'
  const otherImage = otherData?.image || otherProfile?.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'

  if (!selectedConversationId && !selectedProviderId) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center px-6">
        <p className="text-muted-foreground">No conversation selected</p>
        <button onClick={goBack} className="btn btn-primary mt-4">{t('goBack')}</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-background/95 backdrop-blur flex items-center gap-4">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <img src={otherImage} alt={otherName} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <p className="text-title text-foreground">{otherName}</p>
          <p className="text-caption text-primary">{t('online')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.uid
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-[var(--radius-md)] shadow-sm break-words ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card text-foreground rounded-bl-md border border-border'
                }`}>
                  <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {msg.timestamp?.seconds
                      ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-5 bg-background/95 backdrop-blur flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('typeMessage')}
          className="input flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
