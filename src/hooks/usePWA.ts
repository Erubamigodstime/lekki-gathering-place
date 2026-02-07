/**
 * PWA Install and Update Hook
 * 
 * Handles PWA installation prompt and service worker updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOfflineReady: boolean;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isUpdateAvailable: false,
    isOfflineReady: false,
  });

  // Register service worker with auto-update
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ Service Worker registered:', registration);
      
      // Check for updates periodically (every hour)
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    },
  });

  // Update state when offline ready or update available
  useEffect(() => {
    setPwaState(prev => ({
      ...prev,
      isOfflineReady: offlineReady,
      isUpdateAvailable: needRefresh,
    }));
  }, [offlineReady, needRefresh]);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setPwaState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
      console.log('✅ PWA installed successfully');
    };

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setPwaState(prev => ({ ...prev, isInstalled: true }));
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install the PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setPwaState(prev => ({ ...prev, isInstallable: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install error:', error);
      return false;
    }
  }, [installPrompt]);

  // Apply update
  const applyUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  // Dismiss update/offline notifications
  const dismissOfflineReady = useCallback(() => {
    setOfflineReady(false);
  }, [setOfflineReady]);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return {
    ...pwaState,
    installPWA,
    applyUpdate,
    dismissOfflineReady,
    dismissUpdate,
  };
}

export default usePWA;
