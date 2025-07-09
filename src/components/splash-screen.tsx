'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const SPLASH_DURATION = 2000; // 2 seconds
    const FADE_OUT_DURATION = 500; // 0.5 seconds
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

    const lastVisitStr = localStorage.getItem('drishtiDevLastVisit');
    const lastVisit = lastVisitStr ? parseInt(lastVisitStr, 10) : 0;
    const now = Date.now();

    const hasVisitedRecently = (now - lastVisit) < SESSION_TIMEOUT;

    if (hasVisitedRecently) {
      setIsVisible(false);
      return;
    }

    // It's a new session, show the splash
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
      const visibilityTimer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem('drishtiDevLastVisit', now.toString());
      }, FADE_OUT_DURATION);
      
      return () => clearTimeout(visibilityTimer);
    }, SPLASH_DURATION);

    return () => {
        clearTimeout(fadeTimer);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="animate-pulse">
        <Logo className="w-48 h-auto" />
      </div>
    </div>
  );
}
