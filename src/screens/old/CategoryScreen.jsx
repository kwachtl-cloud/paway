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
    <div className="pb-24 animate-fade-in">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-bg-primary px-4 pt-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-text-dark" />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSaved(!isSaved)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
              <Heart size={20} className={isSaved ? 'text-red-500 fill-red-500' : 'text-text-dark'} />
            </button>
            <button onClick={handleShare} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
              <Share2 size={20} className="text-text-dark" />
            </button>
          </div>
        </div>
        <h1 className="font-display text-2xl font-semibold text-text-dark">
          {isVet ? t('findVet') : t('petSitting')}
        </h1>
        <p className="text-text-light text-sm mt-1">
          {isVet ? (t('findVetDesc') || 'Find qualified veterinarians near you') : t('petSittingDesc')}
        </p>
      </div>

      {/* Illustration */}
      <div className="mx-4 mt-4 bg-beige rounded-3xl p-6 flex items-center justify-center h-48 overflow-hidden">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Background - Room */}
          <rect x="10" y="50" width="80" height="80" rx="8" fill="#E8E0D5" />
          <rect x="110" y="40" width="80" height="90" rx="8" fill="#E8E0D5" />
          {/* Window */}
          <rect x="130" y="45" width="40" height="35" rx="4" fill="#FAF7F2" stroke="#D4A373" strokeWidth="2" />
          <line x1="150" y1="45" x2="150" y2="80" stroke="#D4A373" strokeWidth="2" />
          <line x1="130" y1="62" x2="170" y2="62" stroke="#D4A373" strokeWidth="2" />
          {/* Plant */}
          <rect x="25" y="45" width="12" height="25" rx="4" fill="#D4A373" />
          <ellipse cx="31" cy="35" rx="15" ry="18" fill="#4A5D4E" />
          <ellipse cx="25" cy="30" rx="8" ry="12" fill="#5C7360" />
          <ellipse cx="37" cy="32" rx="8" ry="10" fill="#5C7360" />
          {/* Lamp */}
          <rect x="148" y="15" width="4" height="35" fill="#D4A373" />
          <path d="M 138 20 L 162 20 L 155 8 L 145 8 Z" fill="#D4A373" />
          {/* Person sitting */}
          <circle cx="95" cy="75" r="16" fill="#E8E0D5" />
          <path d="M 82 98 Q 95 88 108 98 L 108 130 L 82 130 Z" fill="#4A5D4E" />
          <circle cx="90" cy="73" r="2" fill="#1A1A1A" />
          <circle cx="100" cy="73" r="2" fill="#1A1A1A" />
          <path d="M 92 80 Q 95 84 98 80" stroke="#1A1A1A" strokeWidth="1.5" fill="none" />
          {/* Dog */}
          <ellipse cx="95" cy="125" rx="22" ry="16" fill="#D4A373" />
          <circle cx="95" cy="108" r="14" fill="#D4A373" />
          <ellipse cx="85" cy="103" rx="5" ry="9" fill="#D4A373" />
          <ellipse cx="105" cy="103" rx="5" ry="9" fill="#D4A373" />
          <circle cx="90" cy="106" r="2" fill="#1A1A1A" />
          <circle cx="100" cy="106" r="2" fill="#1A1A1A" />
          <ellipse cx="95" cy="111" rx="4" ry="3" fill="#1A1A1A" />
          <path d="M 88 114 Q 95 120 102 114" stroke="#1A1A1A" strokeWidth="1" fill="none" />
          {/* Tail */}
          <path d="M 115 120 Q 125 110 120 100" stroke="#D4A373" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Picture frame on wall */}
          <rect x="125" y="55" width="25" height="20" rx="2" fill="white" stroke="#E8E0D5" strokeWidth="2" />
          <circle cx="137" cy="65" r="5" fill="#E8E0D5" />
          {/* Floor */}
          <rect x="10" y="130" width="180" height="4" fill="#D4A373" opacity="0.3" />
        </svg>
      </div>

      {/* Features */}
      <div className="px-4 mt-6 space-y-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon size={18} className="text-brand-green" />
            </div>
            <div>
              <p className="font-medium text-text-dark text-sm">{title}</p>
              <p className="text-text-light text-xs mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 mt-8">
        <button
          onClick={() => navigate(isVet ? 'search-vet' : 'search-sitter')}
          className="w-full bg-brand-green text-white py-4 rounded-2xl font-medium active:scale-95 transition-transform shadow-lg shadow-brand-green/20"
        >
          {isVet ? t('findVet') : t('findASitter')}
        </button>
        <button className="w-full text-text-light text-sm py-3 flex items-center justify-center gap-1 mt-2 active:scale-95 transition-transform">
          {t('learnMore')}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L6 10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
