import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Heart, Share2, Shield, Star, ChevronDown, MapPin, Clock, DollarSign } from 'lucide-react'
import { getService, getOrCreateConversation } from '../firebase/services'

export default function ProviderProfileScreen() {
  const { t, goBack, navigate, selectedProviderId, lang, user } = useApp()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (!selectedProviderId) {
      console.log('No provider ID selected')
      return
    }
    
    console.log('Fetching provider with ID:', selectedProviderId)
    setLoading(true)
    getService(selectedProviderId)
      .then(data => {
        console.log('Provider data received:', data)
        setProvider(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching provider:', err)
        setProvider(null)
        setLoading(false)
      })
  }, [selectedProviderId])

  const handleShare = () => {
    if (navigator.share && provider) {
      navigator.share({ title: provider.name, text: `Check out ${provider.name} on Paway!`, url: window.location.href })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-light">{t('loading')}</p>
      </div>
    )
  }

  if (!selectedProviderId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text-light">No provider selected</p>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center h-screen animate-fade-in">
        <div className="text-center">
          <p className="text-text-light mb-4">Provider not found</p>
          <button onClick={goBack} className="px-4 py-2 bg-brand-green text-white rounded-xl text-sm">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { value: provider.reviews || 0, label: t('reviews') },
    { value: 36, label: t('repeatClients') },
    { value: '100%', label: t('responseRate') },
  ]

  const services = [
    { name: t('petSitting'), price: `$${provider.price || 25} / night`, icon: 'home' },
    { name: t('doggyDayCare'), price: `$${Math.round((provider.price || 25) * 0.8)} / day`, icon: 'sun' },
  ]

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      {/* Header with Back Button */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <button onClick={goBack} className="w-11 h-11 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSaved(!isSaved)} className="w-11 h-11 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Heart size={20} className={isSaved ? 'text-destructive fill-destructive' : 'text-foreground'} />
          </button>
          <button onClick={handleShare} className="w-11 h-11 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <Share2 size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Large Profile Photo */}
      <div className="px-6 mb-6">
        <div className="relative w-full aspect-square rounded-[var(--radius-lg)] overflow-hidden shadow-xl">
          <img 
            src={provider.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop'} 
            alt={provider.name} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-lg">
            <Shield size={22} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Name & Rating */}
      <div className="px-6 mb-6">
        <h1 className="text-display text-foreground mb-2">{provider.name}</h1>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-title font-bold">{provider.rating || 0}</span>
            <span className="text-body text-muted-foreground">({provider.reviews || 0})</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="badge badge-live">{t('verified')}</span>
        </div>
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          <MapPin size={16} />
          <span>{provider.location?.address || provider.location || 'Location not set'}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {(provider.tags || [t('dogLover'), t('catFriendly'), t('homeWithYard')]).map(tag => (
            <span key={tag} className="px-3 py-1.5 bg-secondary text-foreground text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="px-6 mb-6">
        <h3 className="text-title text-foreground mb-3">{t('about')}</h3>
        <p className="text-body text-muted-foreground leading-relaxed">
          {provider.description?.[lang] || provider.description || `Hi! I'm ${provider.name}, a true animal lover with years of experience caring for pets.`}
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="card rounded-[var(--radius-md)] p-5 flex justify-around">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-heading text-foreground">{value}</p>
              <p className="text-caption text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="px-6 mb-6">
        <h3 className="text-title text-foreground mb-4">{t('servicesAndRates')}</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <button
              key={service.name}
              onClick={() => navigate('booking')}
              className="card w-full p-4 flex items-center justify-between active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center">
                  <MapPin size={18} className="text-primary" />
                </div>
                <span className="text-body text-foreground font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body text-muted-foreground">{service.price}</span>
                <ChevronDown size={16} className="text-muted-foreground -rotate-90" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 space-y-3">
        <button
          onClick={() => navigate('booking')}
          className="btn btn-primary btn-lg w-full"
        >
          {t('bookWith').replace('{name}', provider.name)}
        </button>
        <button
          onClick={async () => {
            if (!user?.uid || !provider?.id) return
            try {
              const convId = await getOrCreateConversation(user.uid, provider.id, {
                name: provider.name,
                image: provider.image,
                role: provider.type || 'provider',
              })
              navigate('chat', { conversationId: convId })
            } catch (err) {
              console.error('Failed to start conversation:', err)
            }
          }}
          className="btn btn-outline btn-lg w-full"
        >
          {t('sendMessage') || 'Send Message'}
        </button>
      </div>
    </div>
  )
}
