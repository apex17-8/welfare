'use client';

import { useEffect, useState } from 'react';

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Only register in production to avoid redirect issues in preview environments
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[v0] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('[v0] Service Worker registration skipped:', error.message);
          // Service Worker registration failures are non-critical
          // The app continues to work without PWA offline support in preview environments
        });
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('[v0] Service Worker registration disabled in development/preview environment');
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold">Install Pure Path</p>
        <p className="text-sm text-blue-100">Add to your home screen for quick access</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="px-4 py-2 text-sm font-medium hover:bg-blue-700 rounded"
        >
          Dismiss
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded font-semibold"
        >
          Install
        </button>
      </div>
    </div>
  );
}
