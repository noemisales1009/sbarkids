import React, { createContext, useContext, useEffect, useState } from 'react';

export type Viewport = 'mobile' | 'tablet' | 'desktop';

interface ViewportContextType {
  viewport: Viewport;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState<Viewport>('mobile');
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (width < 640) {
      setViewport('mobile');
    } else if (width < 1024) {
      setViewport('tablet');
    } else {
      setViewport('desktop');
    }
  }, [width]);

  const value = {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    width,
  };

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>;
};

export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
};
