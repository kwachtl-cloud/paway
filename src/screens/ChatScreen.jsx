import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Send, User } from 'lucide-react'
import {
  subscribeToMessages,
  sendMessage,
  getOrCreateConversation,
  markConversationRead,
  getUserProfile,
  subscribeToConversation,
} from '../firebase/services'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'

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
            otherDetails.image = profile.photoURL
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
  const otherImage = otherData?.image || otherProfile?.photoURL || null

  if (!selectedConversationId && !selectedProviderId) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center px-6">
        <p className="font-inter text-text-gray mb-4">No conversation selected</p>
        <button 
          onClick={goBack} 
          className="px-6 py-3 bg-lime-gradient rounded-xl font-poppins font-semibold text-bg-dark active:scale-95 transition-transform"
        >
          {t('goBack')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark pb-24 flex flex-col">
      <DarkHeader 
        title="Chat"
        onBack={goBack}
      >
        <div className="px-4 pb-4 pt-2 flex items-center gap-3">
          {/* Other user avatar */}
          {otherImage ? (
            <img 
              src={otherImage} 
              alt={otherName} 
              className="w-14 h-14 rounded-full object-cover border-2 border-card-2/20" 
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-lime-1 to-lime-2 rounded-full flex items-center justify-center">
              <User size={24} className="text-bg-dark" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-poppins font-semibold text-card">{otherName}</p>
            <p className="font-inter text-xs text-text-gray">{t('online')}</p>
          </div>
        </div>
      </DarkHeader>

      <WhiteCard className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-inter text-text-gray">{t('loading')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="font-inter text-text-gray">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user?.uid
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                    isOwn
                      ? 'bg-lime-gradient rounded-tr-sm'
                      : 'bg-card-2 rounded-tl-sm'
                  }`}>
                    <p className={`font-inter text-sm leading-relaxed break-words ${
                      isOwn ? 'text-lime-dark' : 'text-text-dark'
                    }`}>
                      {msg.text}
                    </p>
                    <p className={`font-inter text-[10px] mt-1 ${
                      isOwn ? 'text-lime-dark/70' : 'text-text-faint'
                    }`}>
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

        {/* Input Bar */}
        <div className="px-4 py-4 border-t border-border flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('typeMessage') || 'Type a message...'}
            className="flex-1 px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-lime-2 outline-none font-inter text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-12 h-12 bg-lime-gradient rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 shadow-md"
          >
            <Send size={18} className="text-bg-dark" />
          </button>
        </div>
      </WhiteCard>
    </div>
  )
}
