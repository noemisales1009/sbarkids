import React, { useState, useEffect } from 'react';

const OfflineOverlay: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [wasOffline]);

  if (!isOffline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-xl animate-slide-in">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Conexão restabelecida!
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a9fd4] rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="text-8xl font-black text-white mb-1 leading-none">
          4<span className="inline-flex items-center justify-center w-16 h-16 mx-1 mb-2">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <circle cx="32" cy="32" r="30" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="3"/>
              <path d="M10 54 L54 10" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M32 18 C22 18 14 24 10 32 C14 40 22 46 32 46 C42 46 50 40 54 32 C50 24 42 18 32 18Z" stroke="white" strokeWidth="3" fill="none"/>
              <path d="M32 24 C26 24 21 27.5 18 32 C21 36.5 26 40 32 40 C38 40 43 36.5 46 32 C43 27.5 38 24 32 24Z" stroke="white" strokeWidth="3" fill="none"/>
              <circle cx="32" cy="32" r="4" fill="white"/>
            </svg>
          </span>4
        </div>

        <h2 className="text-2xl font-black text-white mb-1">SEM CONEXÃO</h2>
        <p className="text-white/80 text-sm mb-6">Desculpe, você está offline.</p>

        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 120 60" className="w-48" fill="none">
            <path d="M20 55 Q35 20 55 30" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="20" cy="55" r="4" fill="#f59e0b"/>
            <rect x="8" y="38" width="12" height="18" rx="2" fill="#f59e0b"/>
            <path d="M100 55 Q85 20 65 30" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="100" cy="55" r="4" fill="white" stroke="white"/>
            <path d="M94 40 L106 40 L103 55 L97 55 Z" fill="white"/>
          </svg>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors border border-white/30"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
};

export default OfflineOverlay;
