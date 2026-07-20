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
    setTimeout(() => {
      setScanning(false)
      setComplete(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#0E2F28] text-white px-5 pt-5 flex flex-col">
      <button onClick={handleBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform self-start mb-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {complete ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-5 shadow-[0_18px_32px_rgba(0,0,0,0.18)]">
            <CheckCircle size={56} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('scanComplete')}</h2>
          <p className="text-white/60 text-sm">{t('scanId')}</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 bg-white/8 rounded-[34px] overflow-hidden border border-white/10 mb-6 shadow-[0_20px_46px_rgba(0,0,0,0.22)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <Dog size={92} className="text-white/10" />
              </div>

              {scanning && (
                <div className="absolute left-0 right-0 h-1 bg-white shadow-lg shadow-white/40 animate-scan-line" />
              )}

              <div className="absolute top-4 left-4 w-9 h-9 border-t-2 border-l-2 border-white rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-9 h-9 border-t-2 border-r-2 border-white rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-9 h-9 border-b-2 border-l-2 border-white rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-9 h-9 border-b-2 border-r-2 border-white rounded-br-xl" />
            </div>

            <p className="text-white/65 text-center mb-8 text-sm max-w-[240px] leading-relaxed">
              {scanning ? t('scanning') : t('positionNose')}
            </p>

            {!scanning && (
              <button
                onClick={startScan}
                className="flex items-center gap-2 bg-white text-[#173B31] px-6 py-3 rounded-[20px] font-bold transition-all active:scale-95"
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
