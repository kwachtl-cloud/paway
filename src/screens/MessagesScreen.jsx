import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getUserConversations, getUserProfile, subscribeToConversation } from '../firebase/services'
import { MessageSquare, User } from 'lucide-react'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Card from '../components/Card'

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
    <div className="min-h-screen bg-bg-dark pb-24">
      <DarkHeader 
        title="Messages"
        onBack={goBack}
      >
        <div className="px-4 pb-4 pt-2 text-center">
          <p className="font-inter text-sm text-text-gray">
            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
          </p>
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
            <p className="font-inter text-sm text-text-gray max-w-xs mx-auto">
              Start connecting with other pet owners in your area
            </p>
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
    </div>
  )
}
