import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Camera, CheckCircle, Dog } from 'lucide-react'

export default function NoseIDScanner() {
  const { t, goBack } = useApp()
  const [scanning, setScanning] = useState(false)
  const [complete, setComplete] = useState(false)

  const handleBack = () => {
    setScanning(false)
    setComplete(false)
    goBack()
  }

  const startScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setComplete(true) }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-5 pt-6 flex flex-col">
      <button onClick={handleBack} className="w-11 h-11 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center active:scale-95 transition-transform self-start mb-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {complete ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in pb-20">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={52} className="text-green-400" strokeWidth={1.8} />
          </div>
          <h2 className="font-display text-3xl mb-2">{t('scanComplete')}</h2>
          <p className="text-white/60 text-sm">{t('scanId')}</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl mb-2">Nose ID Scanner</h2>
            <p className="text-white/50 text-sm">Unique like a fingerprint</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center pb-10">
            {/* Scanner Frame */}
            <div className="relative w-72 h-72 bg-gray-800/50 rounded-[2rem] overflow-hidden border border-white/10 mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <Dog size={96} className="text-white/10" strokeWidth={1.2} />
              </div>

              {scanning && (
                <div className="absolute left-0 right-0 h-1 bg-green-400 shadow-lg shadow-green-400/50 animate-scan-line" />
              )}

              <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-green-400 rounded-tl-2xl" />
              <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-green-400 rounded-tr-2xl" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-green-400 rounded-bl-2xl" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-green-400 rounded-br-2xl" />
            </div>

            <p className="text-white/60 text-center mb-8 text-sm max-w-[260px] leading-relaxed">
              {scanning ? t('scanning') : t('positionNose')}
            </p>

            {!scanning && (
              <button
                onClick={startScan}
                className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-light px-7 py-4 rounded-2xl font-semibold transition-all active:scale-95 shadow-lg shadow-brand-green/30"
              >
                <Camera size={20} />
                {t('scanNoseId')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
