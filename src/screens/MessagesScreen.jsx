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
  const [starting, setStarting] = useState(null) // uid of user being opened
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
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
      setStarting(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[400px] bg-card rounded-t-[24px] pb-safe overflow-hidden"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-poppins font-semibold text-base text-text-dark">New conversation</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-card-2 text-text-gray active:scale-95">
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3 bg-card-2 rounded-2xl px-4 py-3 border border-border">
            <Search size={16} className="text-text-faint flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent font-inter text-sm text-text-dark placeholder:text-text-faint outline-none"
            />
            {searching && <Loader size={14} className="text-text-faint animate-spin flex-shrink-0" />}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(80vh - 130px)' }}>
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <p className="font-inter text-xs text-text-faint text-center py-4">Type at least 2 characters…</p>
          )}
          {!searching && searchTerm.trim().length >= 2 && results.length === 0 && (
            <p className="font-inter text-xs text-text-gray text-center py-4">No users found</p>
          )}
          {results.map((u) => (
            <button
              key={u.uid}
              onClick={() => handleSelect(u)}
              disabled={!!starting}
              className="w-full flex items-center gap-3 py-3 px-1 rounded-xl active:bg-card-2 transition-colors text-left disabled:opacity-60"
            >
              {u.photoURL ? (
                <img src={u.photoURL} alt={u.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-bg-dark" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-inter font-semibold text-sm text-text-dark truncate">{u.name}</p>
                <p className="font-inter text-xs text-text-gray truncate">{u.email}</p>
              </div>
              {starting === u.uid && <Loader size={16} className="text-lime-2 animate-spin flex-shrink-0" />}
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
