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
      <div className="rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full mx-4 text-center">
        <img src="/offline.png" alt="Sem conexão" className="w-full" />
        <div className="bg-[#1a9fd4] py-4 px-6">
          <button
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors border border-white/30"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineOverlay;
