'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, set } from 'firebase/database';
import { database, isFirebaseConfigured } from '@/lib/firebase';
import { PreviewWorkspace } from '@/components/preview-workspace';
import { Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SharedSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [sessionExists, setSessionExists] = useState<boolean | null>(null);
  
  // State for raw data from Firebase
  const [sessionData, setSessionData] = useState<any>(null);
  
  // Local state for UI
  const [url, setUrl] = useState('');
  const [previews, setPreviews] = useState<any[]>([]);
  const [background, setBackground] = useState('none');
  const [theme, setTheme] = useState('default');
  const [lastInteractedUrl, setLastInteractedUrl] = useState<string | null>(null);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  
  // Effect 1: Fetch data from Firebase
  useEffect(() => {
    if (!sessionId || !database) return;
    const sessionRef = ref(database, 'sessions/' + sessionId);
    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSessionExists(true);
          setSessionData(data);
        } else {
          setSessionExists(false);
        }
      },
      (error) => {
        console.error(error);
        setSessionExists(false);
      }
    );
    return () => unsubscribe();
  }, [sessionId]);

  // Effect 2: Sync Firebase data to local UI state
  useEffect(() => {
    if (!sessionData) return;

    const newUrl = sessionData.url || '';
    setUrl(newUrl);
    setBackground(sessionData.background || 'none');
    setTheme(sessionData.theme || 'default');

    setPreviews(currentLocalPreviews => {
      const newPreviewsConfig = sessionData.previews || [];
      
      return newPreviewsConfig.map((p_config: any) => {
        const existing = currentLocalPreviews.find(p => p.id === p_config.id);
        // Reset the live URL only if the base URL has changed, or if there's no existing state for it.
        const shouldResetLiveUrl = !existing || (url && existing.base_url !== url);

        return {
          ...p_config,
          liveUrl: shouldResetLiveUrl ? newUrl : existing.liveUrl,
          base_url: newUrl, // Track the base url for comparison
          isDevToolsOpen: existing?.isDevToolsOpen || false,
          refreshKey: existing?.refreshKey || 0,
        };
      });
    });
  }, [sessionData, url]);


  const handleUrlChange = (newUrl: string) => {
    if (!database) return;
    // Update local state for responsiveness and write to Firebase
    setUrl(newUrl);
    setPreviews(currentPreviews => currentPreviews.map(p => ({ ...p, liveUrl: newUrl, base_url: newUrl })));
    setLastInteractedUrl(null);
    const sessionRef = ref(database, `sessions/${sessionId}/url`);
    set(sessionRef, newUrl);
  };
  
  const handleLiveUrlChange = (previewId: string, newUrl: string) => {
    setPreviews(currentPreviews =>
      currentPreviews.map(p =>
        p.id === previewId ? { ...p, liveUrl: newUrl } : p
      )
    );
    setLastInteractedUrl(newUrl);
  };

  const handlePreviewsChange = (newPreviewsOrUpdater: any) => {
     if (!database) return;
     const updatedPreviews =
      typeof newPreviewsOrUpdater === 'function'
        ? newPreviewsOrUpdater(previews)
        : newPreviewsOrUpdater;

    // Update local state, preserving ephemeral data
    setPreviews(updatedPreviews);

    // Strip ephemeral state before persisting to Firebase
    const previewsToSave = updatedPreviews.map(({ liveUrl, base_url, ...rest }: any) => rest);
    const sessionRef = ref(database, `sessions/${sessionId}/previews`);
    set(sessionRef, previewsToSave);
  };

  const handleBackgroundChange = (newBg: string) => {
    if (!database) return;
    setBackground(newBg);
    const sessionRef = ref(database, `sessions/${sessionId}/background`);
    set(sessionRef, newBg);
  };
  
  const handleThemeChange = (newTheme: string) => {
    if (!database) return;
    setTheme(newTheme);
    const sessionRef = ref(database, `sessions/${sessionId}/theme`);
    set(sessionRef, newTheme);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="w-full max-w-2xl p-8 space-y-4">
          <Alert variant="destructive">
            <Terminal className="w-4 h-4" />
            <AlertTitle>Firebase Not Configured</AlertTitle>
            <AlertDescription>
              This is a shared session page, which requires a Firebase connection to work. The app owner needs to configure their Firebase credentials.
              <ol className="mt-4 space-y-2 list-decimal list-inside">
                <li>If you are the owner, find the <strong>.env.example</strong> file in the project root.</li>
                <li>Rename it to <strong>.env.local</strong> and fill in your Firebase project credentials.</li>
                <li>Restart your development server and share a new session link.</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (sessionExists === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
        <p className="text-xl text-muted-foreground">Joining session...</p>
      </div>
    );
  }

  if (sessionExists === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
        <h1 className="text-2xl font-bold">Session Not Found</h1>
        <p className="text-muted-foreground">
          The session you are trying to join does not exist.
        </p>
        <Button onClick={() => router.push('/')}>
          Create a New Session
        </Button>
      </div>
    );
  }

  return (
    <PreviewWorkspace
      url={url}
      setUrl={handleUrlChange}
      previews={previews}
      setPreviews={handlePreviewsChange}
      background={background}
      setBackground={handleBackgroundChange}
      theme={theme}
      setTheme={handleThemeChange}
      isSharedSession={true}
      onLiveUrlChange={handleLiveUrlChange}
      lastInteractedUrl={lastInteractedUrl}
      maximizedId={maximizedId}
      setMaximizedId={setMaximizedId}
    />
  );
}
