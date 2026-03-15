'use client';

import { useEffect, useState } from 'react';

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [manifestLoaded, setManifestLoaded] = useState(false);

  useEffect(() => {
    // Check if manifest is accessible
    const checkManifest = async () => {
      try {
        const res = await fetch('/api/manifest');
        if (res.ok) {
          setManifestLoaded(true);
          console.log('[PWA] Manifest loaded successfully');
        } else {
          console.log('[PWA] Manifest not available (status:', res.status, ')');
        }
      } catch (error) {
        console.log('[PWA] Manifest check failed:', error);
      }
    };

    checkManifest();

    // Register service worker only if manifest is accessible
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Add a delay to ensure manifest check completes
      const timer = setTimeout(() => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[v0] Service Worker registered:', registration);
            
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.log('[v0] Service Worker registration failed:', error.message);
          });
      }, 2000);

      return () => clearTimeout(timer);
    } else if (process.env.NODE_ENV !== 'production') {
      console.log('[v0] Service Worker registration disabled in development');
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
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt || !manifestLoaded) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom">
      <div>
        <p className="font-semibold">Install Pure Path</p>
        <p className="text-sm text-blue-100">Add to your home screen for quick access</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="px-4 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 text-sm font-medium bg-white text-blue-600 hover:bg-blue-50 rounded font-semibold transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
