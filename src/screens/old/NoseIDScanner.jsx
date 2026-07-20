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
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-6 flex flex-col">
      <button onClick={handleBack} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform self-start mb-6">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {complete ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={48} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('scanComplete')}</h2>
          <p className="text-white/60 text-sm">{t('scanId')}</p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Scanner Frame */}
            <div className="relative w-64 h-64 bg-gray-800 rounded-3xl overflow-hidden border-2 border-white/10 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <Dog size={80} className="text-white/10" />
              </div>

              {/* Scanning Animation */}
              {scanning && (
                <div className="absolute left-0 right-0 h-1 bg-green-400 shadow-lg shadow-green-400/50 animate-scan-line" />
              )}

              {/* Corner Markers */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
            </div>

            <p className="text-white/60 text-center mb-8 text-sm">
              {scanning ? t('scanning') : t('positionNose')}
            </p>

            {!scanning && (
              <button
                onClick={startScan}
                className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-light px-6 py-3 rounded-xl font-medium transition-all active:scale-95"
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
