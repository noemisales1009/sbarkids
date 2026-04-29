import React, { createContext, useContext, useState, useEffect } from 'react';

interface NetworkContextType {
    isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const check = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', check);
        window.addEventListener('offline', check);
        const interval = setInterval(check, 3000);

        return () => {
            window.removeEventListener('online', check);
            window.removeEventListener('offline', check);
            clearInterval(interval);
        };
    }, []);

    return (
        <NetworkContext.Provider value={{ isOnline }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => useContext(NetworkContext);
