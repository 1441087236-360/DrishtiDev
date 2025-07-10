
"use client";

import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface ResponsivePreviewProps {
  id: string;
  url: string;
  width: number;
  height: number;
  title: string;
  isDevToolsOpen: boolean;
  isWallpaperActive: boolean;
}

export function ResponsivePreview({ id, url, width, height, title, isDevToolsOpen, isWallpaperActive }: ResponsivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  const frameConfig = {
    mobile: { bezel: 10, radius: 'rounded-[2rem]', iframeRadius: 'rounded-[1.5rem]' },
    tablet: { bezel: 12, radius: 'rounded-[1.5rem]', iframeRadius: 'rounded-xl' },
    desktop: { bezel: 16, radius: 'rounded-xl', iframeRadius: 'rounded-md' }
  };

  const currentFrame = frameConfig[device];
  const frameWidth = width + currentFrame.bezel * 2;
  const frameHeight = height + currentFrame.bezel * 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width: containerWidth, height: containerHeight } = entries[0].contentRect;
        
        if (frameWidth > 0 && frameHeight > 0) {
          const scaleX = containerWidth / frameWidth;
          const scaleY = containerHeight / frameHeight;
          const newScale = Math.min(scaleX, scaleY); 
          setScale(newScale > 0 ? newScale : 0);
        }
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [frameWidth, frameHeight]);
  
  const useProxy = isDevToolsOpen && !url.includes('localhost');
  const previewUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(url)}&previewId=${id}` : url;
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div 
        className={cn(
          "flex items-center justify-center shrink-0 shadow-2xl",
          isWallpaperActive ? 'bg-black/50' : 'bg-black',
          currentFrame.radius,
        )}
        style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            visibility: scale > 0 ? 'visible' : 'hidden',
        }}
      >
        <iframe
          key={`${id}-${previewUrl}`}
          src={previewUrl}
          title={title}
          width={width}
          height={height}
          style={{
            backgroundColor: isWallpaperActive ? 'transparent' : 'hsl(var(--background))',
            flexShrink: 0,
          }}
          className={cn(
            'border-none',
            currentFrame.iframeRadius
          )}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
