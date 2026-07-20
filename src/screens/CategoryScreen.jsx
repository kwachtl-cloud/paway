import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Heart, Share2, Shield, Heart as HeartIcon, Calendar, Star } from 'lucide-react'

export default function CategoryScreen() {
  const { t, goBack, navigate, currentScreen } = useApp()
  const [isSaved, setIsSaved] = useState(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: t('petSitting'), text: `Check out ${t('petSitting')} on Paway!`, url: window.location.href })
    }
  }

  const isVet = currentScreen === 'search-vet'

  const features = [
    { icon: Shield, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: HeartIcon, title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: Calendar, title: t('feature3Title'), desc: t('feature3Desc') },
  ]

  return (
    <div className="min-h-screen bg-background pb-32 animate-fade-in">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="w-10 h-10 bg-card rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-title text-foreground">
            {isVet ? t('findVet') : t('petSitting')}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSaved(!isSaved)} className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
              <Heart size={20} className={isSaved ? 'text-destructive fill-destructive' : 'text-foreground'} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-2 rounded-[var(--radius-lg)] overflow-hidden h-56 relative shadow-lg">
        <img
          src={isVet ? 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=420&fit=crop' : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=420&fit=crop'}
          alt=""
          className="w-full h-full object-cover"
        />
        <button onClick={handleShare} className="absolute top-4 right-4 w-10 h-10 bg-card/85 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
          <Share2 size={18} className="text-foreground" />
        </button>
      </div>

      <div className="px-6 mt-6">
        <div className="card rounded-[var(--radius-lg)] p-6">
          <h2 className="text-heading text-foreground">
            {isVet ? t('findVet') : t('petSitting')}
          </h2>
          <div className="flex items-center gap-4 mt-3 text-caption text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Star size={13} className="text-warning fill-warning" /> 4.9</span>
            <span>•</span>
            <span>30–60 min</span>
          </div>
          <p className="text-body text-muted-foreground mt-4 leading-relaxed">
            {isVet ? (t('findVetDesc') || 'Find qualified veterinarians near you') : t('petSittingDesc')}
          </p>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card rounded-[var(--radius-md)] p-5 flex items-start gap-4">
            <div className="w-11 h-11 bg-primary-soft rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-foreground" />
            </div>
            <div>
              <p className="text-title text-foreground">{title}</p>
              <p className="text-caption text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed left-0 right-0 bottom-0 px-6 pt-4 pb-8 bg-background/95 backdrop-blur">
        <button
          onClick={() => navigate(isVet ? 'search-vet' : 'search-sitter')}
          className="btn btn-primary btn-lg w-full"
        >
          {isVet ? t('findVet') : t('findASitter')}
        </button>
      </div>
    </div>
  )
}
