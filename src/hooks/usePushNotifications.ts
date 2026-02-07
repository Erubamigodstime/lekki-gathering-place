/**
 * Push Notifications Hook
 * 
 * Handles web push notification subscription and permission management
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

// VAPID public key - fetched from server dynamically
let VAPID_PUBLIC_KEY: string | null = null;

// Fetch VAPID key from server
async function fetchVapidKey(): Promise<string | null> {
  if (VAPID_PUBLIC_KEY) return VAPID_PUBLIC_KEY;
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://lekki-gathering-place-backend-1.onrender.com/api/v1';
    const response = await fetch(`${API_URL}/push/vapid-key`);
    const data = await response.json();
    VAPID_PUBLIC_KEY = data.data?.vapidKey || null;
    return VAPID_PUBLIC_KEY;
  } catch (error) {
    console.error('Failed to fetch VAPID key:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Check push notification support and current state
  useEffect(() => {
    const checkPushSupport = async () => {
      // Check if push is supported
      const isSupported = 
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window;

      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false }));
        return;
      }

      const permission = Notification.permission;
      
      // Check if already subscribed
      let isSubscribed = false;
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
      } catch (error) {
        console.error('Error checking subscription:', error);
      }

      setState(prev => ({
        ...prev,
        isSupported: true,
        permission,
        isSubscribed,
      }));
    };

    checkPushSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
      return false;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Push notifications not supported' }));
      return false;
    }

    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Fetch VAPID key from server
        const vapidKey = await fetchVapidKey();
        if (!vapidKey) {
          throw new Error('VAPID public key not available');
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      // Send subscription to server
      await apiClient.post('/push/subscribe', {
        subscription: subscription.toJSON(),
      });

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        isLoading: false,
        error: null,
      }));

      console.log('✅ Push notification subscription successful');
      return true;

    } catch (error: any) {
      console.error('Subscription error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to subscribe',
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Notify server
        await apiClient.post('/push/unsubscribe', {
          endpoint: subscription.endpoint,
        });

        // Unsubscribe locally
        await subscription.unsubscribe();
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false,
        error: null,
      }));

      console.log('✅ Push notification unsubscribed');
      return true;

    } catch (error: any) {
      console.error('Unsubscribe error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to unsubscribe',
      }));
      return false;
    }
  }, []);

  // Toggle subscription
  const toggleSubscription = useCallback(async (): Promise<boolean> => {
    if (state.isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}

export default usePushNotifications;
