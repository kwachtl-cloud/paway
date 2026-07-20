import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getUserConversations, getUserProfile, subscribeToConversation } from '../firebase/services'

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
  const image = otherData?.image || otherProfile?.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
  const unread = liveConv.unreadCount?.[userUid] || 0
  const lastMsg = liveConv.lastMessage
  const time = lastMsg?.timestamp?.seconds
    ? new Date(lastMsg.timestamp.seconds * 1000).toLocaleDateString()
    : ''

  return (
    <div
      onClick={() => onClick(liveConv.id)}
      className="card rounded-[var(--radius-md)] p-4 flex items-center gap-3 active:scale-[0.99] transition-transform cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1 gap-2">
          <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>{name}</p>
          {time && <span className="text-[10px] text-muted-foreground flex-shrink-0">{time}</span>}
        </div>
        <p className={`text-xs truncate ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {lastMsg?.text || 'No messages yet'}
        </p>
      </div>
    </div>
  )
}

export default function MessagesScreen() {
  const { t, navigate, user } = useApp()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-32 animate-fade-in">
      <h1 className="text-heading text-foreground mb-8">{t('messages')}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">{t('noMessagesYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
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
    </div>
  )
}
