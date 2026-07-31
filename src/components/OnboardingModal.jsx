import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Shield, Users, AlertTriangle, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import Button from './Button'

export default function OnboardingModal() {
  const { user, navigate, t } = useApp()
  const [isVisible, setIsVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.uid) return
      
      // Check localStorage first (fast)
      const hasSeenLocal = localStorage.getItem(`hasSeenOnboarding_${user.uid}`)
      if (hasSeenLocal === 'true') {
        setIsVisible(false)
        return
      }
      
      // Show onboarding for new users
      setIsVisible(true)
    }
    
    checkOnboarding()
  }, [user])

  const slides = [
    {
      icon: Shield,
      color: 'coral',
      title: t('onboardingSlide1Title') || '🛡️ Bezpieczne Spacery',
      description: t('onboardingSlide1Desc') || 'Hazard Radar ostrzeże Cię przed trutkami, szkłem i dzikimi zwierzętami na trasie spaceru.',
      gradient: 'from-coral/20 to-coral/5'
    },
    {
      icon: Users,
      color: 'blue-1',
      title: t('onboardingSlide2Title') || '🐾 Sfora w Parku',
      description: t('onboardingSlide2Desc') || 'Sprawdzaj w Park Radarze, jakie psy spacerują w Twojej okolicy. Organizuj spotkania i buduj społeczność!',
      gradient: 'from-blue-1/20 to-blue-1/5'
    },
    {
      icon: AlertTriangle,
      color: 'amber',
      title: t('onboardingSlide3Title') || '🚨 System SOS',
      description: t('onboardingSlide3Desc') || 'W razie zagubienia psa natychmiast zaalarmujesz właścicieli psów w promieniu 10 km. Wspólnie działamy szybciej!',
      gradient: 'from-amber/20 to-amber/5'
    }
  ]

  const handleComplete = async () => {
    if (!user?.uid) return
    
    try {
      // Save to localStorage (immediate)
      localStorage.setItem(`hasSeenOnboarding_${user.uid}`, 'true')
      
      // Save to Firestore (persistent across devices)
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        hasSeenOnboarding: true,
        onboardingCompletedAt: new Date()
      })
      
      // Close modal and navigate to Pet Passport
      setIsVisible(false)
      navigate('pet-passport')
    } catch (error) {
      console.error('Error saving onboarding status:', error)
      // Close anyway if error
      setIsVisible(false)
      navigate('pet-passport')
    }
  }

  const handleSkip = async () => {
    if (!user?.uid) return
    
    // Save skip status
    localStorage.setItem(`hasSeenOnboarding_${user.uid}`, 'true')
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        hasSeenOnboarding: true,
        onboardingSkipped: true
      })
    } catch (error) {
      console.error('Error saving skip status:', error)
    }
    
    setIsVisible(false)
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  if (!isVisible) return null

  const slide = slides[currentSlide]
  const Icon = slide.icon
  const isLastSlide = currentSlide === slides.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-bg-dark/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute -top-12 right-0 text-card-2 font-inter text-sm font-medium hover:text-card transition-colors flex items-center gap-1"
        >
          {t('skip') || 'Pomiń'}
          <X size={16} />
        </button>

        {/* Slide Card */}
        <div className="bg-card rounded-[26px] overflow-hidden shadow-2xl">
          {/* Icon Section with Gradient Background */}
          <div className={`bg-gradient-to-br ${slide.gradient} px-6 py-12 flex flex-col items-center`}>
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ 
                backgroundColor: `var(--${slide.color})`,
                opacity: 0.2
              }}
            >
              <Icon 
                size={40} 
                style={{ color: `var(--${slide.color})` }}
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* Title */}
            <h2 className="font-poppins font-bold text-xl text-text-dark text-center mb-4">
              {slide.title}
            </h2>

            {/* Description */}
            <p className="font-inter text-sm text-text-gray text-center leading-relaxed mb-8">
              {slide.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide
                      ? 'w-8 bg-gradient-to-r from-lime-1 to-lime-2'
                      : 'w-2 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {/* Back Button (only show if not first slide) */}
              {currentSlide > 0 && (
                <Button
                  variant="secondary"
                  onClick={prevSlide}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={18} />
                  <span className="font-inter text-sm">{t('back') || 'Wstecz'}</span>
                </Button>
              )}

              {/* Next/Complete Button */}
              <Button
                variant="primary"
                onClick={isLastSlide ? handleComplete : nextSlide}
                className={`${currentSlide === 0 ? 'w-full' : 'flex-1'} flex items-center justify-center gap-2`}
              >
                <span className="font-poppins text-sm font-semibold">
                  {isLastSlide 
                    ? (t('onboardingComplete') || 'Zacznijmy! Dodaj pierwszego psa 🐾')
                    : (t('next') || 'Dalej')
                  }
                </span>
                {!isLastSlide && <ChevronRight size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Counter */}
        <div className="mt-4 text-center">
          <span className="font-inter text-xs text-card-2">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  )
}
