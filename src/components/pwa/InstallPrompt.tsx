/**
 * PWA Install Prompt Component
 * 
 * Shows a banner prompting users to install the PWA
 */

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  // Show full prompt after a delay for better UX
  useEffect(() => {
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setShowFullPrompt(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  // Don't show if already installed, dismissed, or not installable
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if recently dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!showFullPrompt) {
    // Mini floating button
    return (
      <button
        onClick={() => setShowFullPrompt(true)}
        className="fixed bottom-20 right-4 z-50 p-3 bg-[#1e3a5f] text-white rounded-full shadow-lg hover:bg-[#2a4a6f] transition-all animate-bounce"
        aria-label="Install App"
      >
        <Download className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Install LGP Skills</h3>
          <p className="text-xs text-white/80 mt-0.5">
            Get quick access, offline mode & class reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-[#1e3a5f] hover:bg-white/90"
          >
            <Download className="w-4 h-4 mr-1" />
            Install
          </Button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
