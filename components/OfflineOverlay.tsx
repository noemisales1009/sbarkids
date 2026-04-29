import React, { useState, useEffect } from 'react';
import offlineImg from './offline.png';

const OfflineOverlay: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const check = () => setIsOffline(!navigator.onLine);

    check();

    window.addEventListener('offline', check);
    window.addEventListener('online', check);

    const interval = setInterval(check, 3000);

    return () => {
      window.removeEventListener('offline', check);
      window.removeEventListener('online', check);
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] bg-[#3ba3cd] flex items-center justify-center cursor-pointer"
      onClick={() => window.location.reload()}
      title="Clique para tentar novamente"
    >
      <img
        src={offlineImg}
        alt="Sem conexão"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
};

export default OfflineOverlay;
