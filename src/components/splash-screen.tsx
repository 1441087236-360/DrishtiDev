
'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const themes = [
    { name: 'Default', value: 'default' },
    { name: 'Midnight', value: 'theme-midnight' },
    { name: 'Latte', value: 'theme-latte' },
    { name: 'Solar Flare', value: 'theme-solar-flare' },
];

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // This code now runs only on the client
    const savedTheme = localStorage.getItem('drishtidev-theme') || 'default';
    const root = document.documentElement;
    const themeClasses = themes.map(t => t.value).filter(v => v !== 'default');
    
    themeClasses.forEach(tClass => root.classList.remove(tClass));

    if (savedTheme !== 'default') {
        root.classList.add(savedTheme);
    }
    
    if (savedTheme === 'theme-latte') {
        root.classList.remove('dark');
    } else {
        if (!root.classList.contains('dark')) {
            root.classList.add('dark');
        }
    }

    const SPLASH_DURATION = 1500; // 1.5 seconds
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
        'fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-500',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className={cn(!isFading && 'animate-pulse')}>
        <Logo className="w-96 h-auto" />
      </div>
    </div>
  );
}
