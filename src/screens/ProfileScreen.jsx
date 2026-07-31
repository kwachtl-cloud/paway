import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Globe, PawPrint, Heart, ChevronRight, LogOut, User, Settings, Bell, Camera, MessageCircle, X } from 'lucide-react'
import { logoutUser, uploadProfilePhoto, updateUserPhotoURL, sendFeedback } from '../firebase/services'
import DarkHeader from '../components/DarkHeader'
import WhiteCard from '../components/WhiteCard'
import Button from '../components/Button'
import Card from '../components/Card'

export default function ProfileScreen() {
  const { t, lang, setLang, navigate, setUser, user } = useApp()
  const [uploading, setUploading] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackType, setFeedbackType] = useState('bug')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setUser(null)
    navigate('welcome')
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return

    try {
      setUploading(true)
      console.log('📸 Uploading profile photo...')
      
      const photoURL = await uploadProfilePhoto(user.uid, file)
      console.log('✅ Photo uploaded:', photoURL.substring(0, 50))
      
      await updateUserPhotoURL(user.uid, photoURL)
      console.log('✅ Profile updated')
      
      // Update local user state
      setUser({ ...user, photoURL })
    } catch (error) {
      console.error('❌ Error uploading photo:', error)
      alert('Error uploading photo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim() || !user?.uid) return
    
    setSubmittingFeedback(true)
    try {
      await sendFeedback({
        uid: user.uid,
        userEmail: user.email,
        userName: user.name,
        type: feedbackType,
        message: feedbackMessage.trim(),
        appVersion: '1.0.0',
        platform: 'web'
      })
      
      alert(t('feedbackSuccess') || 'Dziękujemy za opinię! Twoja wiadomość została wysłana.')
      setShowFeedbackModal(false)
      setFeedbackMessage('')
      setFeedbackType('bug')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(t('feedbackError') || 'Wystąpił błąd podczas wysyłania opinii. Spróbuj ponownie.')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const languages = [
    { code: 'pl', label: 'PL' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
  ]

  const menuItems = [
    {
      id: 'pets',
      icon: PawPrint,
      label: 'Pet Passport',
      color: 'lime-2',
      screen: 'pet-passport'
    },
    {
      id: 'feedback',
      icon: MessageCircle,
      label: t('sendFeedback') || '💬 Wyślij opinię / Zgłoś błąd',
      color: 'blue-1',
      action: () => setShowFeedbackModal(true)
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      color: 'text-gray',
      screen: 'profile'
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      color: 'amber',
      screen: 'notifications'
    },
  ]

  return (
    <div className="min-h-screen bg-bg-dark pb-24">
      {/* Dark Header with User Info */}
      <DarkHeader>
        <div className="px-4 pb-6 pt-2 flex flex-col items-center">
          {/* Avatar with Photo Upload */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-lime-1 to-lime-2 flex items-center justify-center">
                  <User size={40} className="text-lime-dark" />
                </div>
              )}
            </div>
            
            {/* Camera Button */}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-lime-gradient rounded-full flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-transform">
              <Camera size={16} className="text-bg-dark" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            {uploading && (
              <div className="absolute inset-0 bg-bg-dark/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-lime-1 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* User Name */}
          <h1 className="font-poppins font-bold text-2xl text-card mb-1">
            {user?.name || 'User'}
          </h1>
          
          {/* Email */}
          <p className="font-inter text-text-gray text-sm mb-4">
            {user?.email || 'user@example.com'}
          </p>
        </div>
      </DarkHeader>

      {/* White Card Content */}
      <WhiteCard>
        {/* Language Switcher */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-text-dark" />
            <h3 className="font-poppins font-semibold text-text-dark text-base">
              {t('language')}
            </h3>
          </div>
          <div className="flex gap-2">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all ${
                  lang === code
                    ? 'bg-gradient-to-r from-lime-1 to-lime-2 text-lime-dark'
                    : 'bg-card-2 text-text-gray'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-8">
          <h3 className="font-poppins font-semibold text-text-dark text-base mb-4">
            Menu
          </h3>
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon
              return (
                <Card
                  key={item.id}
                  onClick={() => item.action ? item.action() : navigate(item.screen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon 
                        size={20} 
                        style={{ color: `var(--${item.color})` }}
                      />
                      <span className="font-inter text-sm font-medium text-text-dark">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-text-gray" />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </Button>
      </WhiteCard>
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-bold text-xl text-text-dark">
                {t('sendFeedback') || '💬 Wyślij opinię'}
              </h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false)
                  setFeedbackMessage('')
                  setFeedbackType('bug')
                }}
                className="text-text-gray hover:text-text-dark transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Feedback Type Selector */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  {t('feedbackType') || 'Typ zgłoszenia'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackType('bug')}
                    className={`flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all ${
                      feedbackType === 'bug'
                        ? 'bg-coral/20 text-coral border-2 border-coral'
                        : 'bg-card-2 text-text-gray'
                    }`}
                  >
                    🐛 {t('bug') || 'Błąd'}
                  </button>
                  <button
                    onClick={() => setFeedbackType('idea')}
                    className={`flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all ${
                      feedbackType === 'idea'
                        ? 'bg-blue-1/20 text-blue-1 border-2 border-blue-1'
                        : 'bg-card-2 text-text-gray'
                    }`}
                  >
                    💡 {t('idea') || 'Pomysł'}
                  </button>
                  <button
                    onClick={() => setFeedbackType('praise')}
                    className={`flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all ${
                      feedbackType === 'praise'
                        ? 'bg-lime-1/30 text-lime-dark border-2 border-lime-2'
                        : 'bg-card-2 text-text-gray'
                    }`}
                  >
                    ❤️ {t('praise') || 'Pochwała'}
                  </button>
                </div>
              </div>
              
              {/* Message Textarea */}
              <div>
                <label className="block font-inter text-sm font-semibold text-text-dark mb-2">
                  {t('feedbackMessage') || 'Twoja wiadomość'}
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder={t('feedbackPlaceholder') || 'Opisz szczegółowo swój problem lub pomysł...'}
                  rows={6}
                  className="w-full px-4 py-3 bg-card-2 text-text-dark placeholder-text-faint rounded-xl border-0 focus:ring-2 focus:ring-blue-1 outline-none font-inter text-sm resize-none"
                />
                <p className="font-inter text-xs text-text-faint mt-2">
                  {t('feedbackPrivacy') || 'Twoja opinia zostanie wysłana wraz z adresem email w celu kontaktu.'}
                </p>
              </div>
              
              {/* Submit Button */}
              <Button
                variant="primary"
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback || !feedbackMessage.trim()}
                className="w-full flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {submittingFeedback ? (t('sending') || 'Wysyłam...') : (t('submit') || 'Wyślij')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
