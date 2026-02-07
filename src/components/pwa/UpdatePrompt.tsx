/**
 * Update Prompt Component
 * 
 * Shows a prompt when a new version of the app is available
 */

import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';

export function UpdatePrompt() {
  const { isUpdateAvailable, isOfflineReady, applyUpdate, dismissUpdate, dismissOfflineReady } = usePWA();

  // Show offline ready notification briefly
  if (isOfflineReady) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-green-600 text-white rounded-lg shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            ✓
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Ready for Offline</h4>
            <p className="text-xs text-white/80 mt-1">
              App has been cached for offline use
            </p>
          </div>
          <button
            onClick={dismissOfflineReady}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Show update available notification
  if (isUpdateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-[#1e3a5f] text-white rounded-lg shadow-2xl p-4 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Update Available</h4>
            <p className="text-xs text-white/80 mt-1">
              A new version is available with improvements
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={applyUpdate}
                size="sm"
                className="bg-white text-[#1e3a5f] hover:bg-white/90 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Update Now
              </Button>
              <Button
                onClick={dismissUpdate}
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default UpdatePrompt;
