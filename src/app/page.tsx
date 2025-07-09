'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ref, set } from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';
import { PreviewWorkspace } from '@/components/preview-workspace';
import { useToast } from "@/hooks/use-toast";

const initialUrl = 'https://reactnative.dev';

// Initial configs do not contain client-side state like liveUrl
const initialPreviewConfigs = [
  { id: 'iphone-se-preview', width: 375, height: 667, title: 'iPhone SE', isDevToolsOpen: false, refreshKey: 0 },
  { id: 'ipad-mini-preview', width: 768, height: 1024, title: 'iPad Mini', isDevToolsOpen: false, refreshKey: 0 },
  { id: 'desktop-preview', width: 1440, height: 900, title: 'Desktop', isDevToolsOpen: false, refreshKey: 0 },
].map(p => ({ ...p, liveUrl: initialUrl }));


export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [url, setUrl] = useState(initialUrl);
  const [previews, setPreviews] = useState<any[]>(initialPreviewConfigs);
  const [background, setBackground] = useState('none');
  const [theme, setTheme] = useState('default');
  const [lastInteractedUrl, setLastInteractedUrl] = useState<string | null>(null);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);

  const handleSetUrl = (newUrl: string) => {
    setUrl(newUrl);
    setPreviews(currentPreviews => 
        currentPreviews.map(p => ({ ...p, liveUrl: newUrl }))
    );
    setLastInteractedUrl(null);
  };

  const handleLiveUrlChange = (previewId: string, newUrl: string) => {
    setPreviews(currentPreviews =>
      currentPreviews.map(p =>
        p.id === previewId ? { ...p, liveUrl: newUrl } : p
      )
    );
    setLastInteractedUrl(newUrl);
  };
  
  const handleShare = async () => {
    if (!database) {
      toast({
        variant: 'destructive',
        title: 'Firebase Not Configured',
        description: 'Please set up your .env.local file to share sessions.',
      });
      return;
    }
    const newSessionId = uuidv4().slice(0, 8);
    // Strip client-side state before saving
    const previewsToSave = previews.map(({ liveUrl, ...rest }) => rest);
    const sessionData = {
      url,
      previews: previewsToSave,
      background,
      theme,
    };
    await set(ref(database, 'sessions/' + newSessionId), sessionData);
    router.push(`/${newSessionId}`);
  };

  return (
    <PreviewWorkspace
      url={url}
      setUrl={handleSetUrl}
      previews={previews}
      setPreviews={setPreviews}
      background={background}
      setBackground={setBackground}
      theme={theme}
      setTheme={setTheme}
      isSharedSession={false}
      onShare={isFirebaseConfigured ? handleShare : undefined}
      onLiveUrlChange={handleLiveUrlChange}
      lastInteractedUrl={lastInteractedUrl}
      maximizedId={maximizedId}
      setMaximizedId={setMaximizedId}
    />
  );
}
