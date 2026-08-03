import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { getUserConversations, getUserProfile, subscribeToConversation, searchUsers, getOrCreateConversation } from '../firebase/services'
import { MessageSquare, User, Plus, X, Search, Loader } from 'lucide-react'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Card from '../components/Card'

// ── New Chat Modal ────────────────────────────────────────────────────────────
function NewChatModal({ currentUid, onClose, onStartChat }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [starting, setStarting] = useState(null)
  const [startError, setStartError] = useState('')
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Delay focus slightly so keyboard doesn't jump immediately
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    setStartError('')
    if (searchTerm.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await searchUsers(searchTerm, currentUid)
        setResults(found)
      } catch (e) {
        console.error('search error', e)
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [searchTerm, currentUid])

  const handleSelect = async (u) => {
    if (starting) return
    setStartError('')
    setStarting(u.uid)
    try {
      const convId = await getOrCreateConversation(currentUid, u.uid, {
        name: u.name,
        image: u.photoURL || null,
        email: u.email,
      })
      onStartChat(convId)
    } catch (e) {
      console.error('start chat error', e)
      setStartError('Could not open chat. Check your connection and try again.')
      setStarting(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[400px] bg-card rounded-t-[26px] overflow-hidden"
        style={{ maxHeight: '90vh', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2 className="font-poppins font-bold text-lg text-text-dark">New conversation</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card-2 text-text-gray active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input — 16px font prevents iOS auto-zoom */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 bg-card-2 rounded-2xl px-4 py-4 border border-border">
            <Search size={18} className="text-text-faint flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              style={{ fontSize: '16px' }}
              className="flex-1 bg-transparent font-inter text-text-dark placeholder:text-text-faint outline-none"
            />
            {searching && <Loader size={16} className="text-text-faint animate-spin flex-shrink-0" />}
          </div>
        </div>

        {/* Error */}
        {startError && (
          <div className="mx-5 mb-3 px-4 py-3 bg-coral/10 rounded-xl">
            <p className="font-inter text-sm text-coral">{startError}</p>
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <p className="font-inter text-sm text-text-faint text-center py-6">Type at least 2 characters…</p>
          )}
          {!searching && searchTerm.trim().length >= 2 && results.length === 0 && (
            <p className="font-inter text-sm text-text-gray text-center py-6">No users found for "{searchTerm}"</p>
          )}
          {results.map((u) => (
            <button
              key={u.uid}
              onClick={() => handleSelect(u)}
              disabled={!!starting}
              className="w-full flex items-center gap-4 py-4 px-2 rounded-2xl active:bg-card-2 transition-colors text-left disabled:opacity-60 border-b border-border last:border-0"
            >
              {u.photoURL ? (
                <img src={u.photoURL} alt={u.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-bg-dark" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-poppins font-semibold text-base text-text-dark truncate">{u.name}</p>
                <p className="font-inter text-sm text-text-gray truncate">{u.email}</p>
              </div>
              {starting === u.uid ? (
                <Loader size={20} className="text-lime-2 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-lime-1/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-lime-2" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConversationItem({ conversation, userUid, onClick }) {
  const [liveConv, setLiveConv] = useState(conversation)
  const [otherProfile, setOtherProfile] = useState(null)

  useEffect(() => {
    setLiveConv(conversation)
    const unsub = subscribeToConversation(conversation.id, (data) => {
      setLiveConv(data)
    })
    return () => unsub()
  }, [conversation.id])

  useEffect(() => {
    const otherId = conversation.participants?.find((id) => id !== userUid)
    if (otherId) {
      getUserProfile(otherId).then(setOtherProfile)
    }
  }, [conversation.participants, userUid])

  const otherId = liveConv.participants?.find((id) => id !== userUid)
  const otherData = liveConv.participantDetails?.[otherId]
  const name = otherData?.name || otherProfile?.name || 'Unknown'
  const image = otherData?.image || otherProfile?.image || null
  const unread = liveConv.unreadCount?.[userUid] || 0
  const lastMsg = liveConv.lastMessage
  const time = lastMsg?.timestamp?.seconds
    ? new Date(lastMsg.timestamp.seconds * 1000).toLocaleDateString()
    : ''

  return (
    <Card
      onClick={() => onClick(liveConv.id)}
      className="cursor-pointer hover:border-lime-2 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-14 h-14 rounded-full object-cover" 
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-lime-1 to-lime-2 rounded-full flex items-center justify-center">
              <User size={24} className="text-bg-dark" />
            </div>
          )}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-gradient text-bg-dark text-[10px] font-poppins font-bold rounded-full flex items-center justify-center shadow-md">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1 gap-2">
            <p className={`font-inter text-sm truncate ${unread > 0 ? 'font-bold text-text-dark' : 'font-semibold text-text-dark'}`}>
              {name}
            </p>
            {time && (
              <span className="font-inter text-[10px] text-text-faint flex-shrink-0">
                {time}
              </span>
            )}
          </div>
          <p className={`font-inter text-xs truncate ${unread > 0 ? 'text-text-dark font-medium' : 'text-text-gray'}`}>
            {lastMsg?.text || 'No messages yet'}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default function MessagesScreen() {
  const { t, goBack, navigate, user } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      setLoading(true)
      getUserConversations(user.uid)
        .then(setConversations)
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const handleStartChat = (conversationId) => {
    setShowNewChat(false)
    navigate('chat', { conversationId })
  }

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      <DarkHeader
        title="Messages"
        onBack={goBack}
      >
        <div className="px-4 pb-4 pt-2 flex items-center justify-between">
          <p className="font-inter text-sm text-text-gray">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-gradient text-bg-dark font-poppins font-semibold text-xs active:scale-95 transition-transform"
          >
            <Plus size={14} strokeWidth={3} />
            New chat
          </button>
        </div>
      </DarkHeader>

      <WhiteCard>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="font-inter text-text-gray">{t('loading')}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-1/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={32} className="text-blue-1" />
            </div>
            <h3 className="font-poppins font-semibold text-lg text-text-dark mb-2">
              No Messages Yet
            </h3>
            <p className="font-inter text-sm text-text-gray max-w-xs mx-auto mb-6">
              Start connecting with other pet owners in your area
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-lime-gradient text-bg-dark font-poppins font-semibold text-sm active:scale-95 transition-transform"
            >
              <Plus size={16} strokeWidth={3} />
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                userUid={user.uid}
                onClick={(conversationId) => navigate('chat', { conversationId })}
              />
            ))}
          </div>
        )}
      </WhiteCard>

      {showNewChat && (
        <NewChatModal
          currentUid={user.uid}
          onClose={() => setShowNewChat(false)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  )
}
