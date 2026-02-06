import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL.replace('/api/v1', '');

interface UseSocketOptions {
  onNewMessage?: (message: any) => void;
  onMessageRead?: (data: { messageId: string; readAt: string }) => void;
  onTypingStart?: (data: { senderId: string }) => void;
  onTypingStop?: (data: { senderId: string }) => void;
  onUserStatus?: (data: { userId: string; isOnline: boolean }) => void;
  onConversationUpdate?: (conversation: any) => void;
  onDeliveryReceipt?: (receipt: { messageId: string; status: 'delivered' | 'read'; timestamp: string }) => void;
  onSyncResponse?: (syncData: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const hasShownInitialToast = useRef(false); // Track if we've shown the initial connection toast
  const optionsRef = useRef(options); // Stable reference to options
  const [isConnected, setIsConnected] = useState(false);
  
  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No auth token found, skipping socket connection');
      return;
    }

    if (socketRef.current?.connected) {
      return; // Already connected
    }

    console.log('Connecting to WebSocket...', SOCKET_URL);

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
    });

    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected');
      reconnectAttempts.current = 0;
      setIsConnected(true);
      
      // Only show toast on first connection, not on reconnects
      if (!hasShownInitialToast.current) {
        toast.success('Real-time messaging connected', { duration: 2000 });
        hasShownInitialToast.current = true;
      }

      // ENTERPRISE: Signal connection ready to receive pending messages
      socketRef.current?.emit('connection:ready');
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socketRef.current?.connect();
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        toast.error('Failed to connect to real-time messaging. Using fallback mode.', {
          duration: 5000,
        });
      }
    });

    // Message events
    socketRef.current.on('message:new', (message) => {
      console.log('📨 New message received:', message);
      
      // ENTERPRISE: Send delivery acknowledgment immediately
      socketRef.current?.emit('message:ack:delivered', { messageId: message.id });
      
      optionsRef.current.onNewMessage?.(message);
      
      // Show notification if not on the chat
      if (document.hidden || !window.location.pathname.includes('/inbox')) {
        toast.info(`New message from ${message.sender.firstName}`, {
          description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          duration: 4000,
        });
      }
    });

    // ENTERPRISE: Handle delivery receipts (for sent messages)
    socketRef.current.on('message:receipt', (receipt) => {
      console.log('📬 Delivery receipt:', receipt);
      optionsRef.current.onDeliveryReceipt?.(receipt);
    });

    // ENTERPRISE: Handle sync response (reconnection recovery)
    socketRef.current.on('sync:response', (syncData) => {
      console.log('🔄 Sync response:', syncData);
      optionsRef.current.onSyncResponse?.(syncData);
      
      if (syncData.hasGap) {
        toast.warning('Some messages may have been missed during disconnection', {
          description: 'Gaps detected in message sequence',
          duration: 5000,
        });
      }
    });

    socketRef.current.on('sync:error', (error) => {
      console.error('Sync error:', error);
      toast.error('Failed to sync messages');
    });

    socketRef.current.on('message:read', (data) => {
      console.log('✓✓ Message read:', data);
      optionsRef.current.onMessageRead?.(data);
    });

    // Typing indicators
    socketRef.current.on('typing:start', (data) => {
      optionsRef.current.onTypingStart?.(data);
    });

    socketRef.current.on('typing:stop', (data) => {
      optionsRef.current.onTypingStop?.(data);
    });

    // User presence
    socketRef.current.on('user:status', (data) => {
      optionsRef.current.onUserStatus?.(data);
    });

    // Conversation updates
    socketRef.current.on('conversation:update', (conversation) => {
      optionsRef.current.onConversationUpdate?.(conversation);
    });

  }, []); // Empty dependencies - only connect once

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Typing indicators
  const emitTypingStart = useCallback((receiverId: string) => {
    emit('typing:start', { receiverId });
  }, [emit]);

  const emitTypingStop = useCallback((receiverId: string) => {
    emit('typing:stop', { receiverId });
  }, [emit]);

  const emitMessageRead = useCallback((messageId: string, senderId: string) => {
    emit('message:read', { messageId, senderId });
  }, [emit]);

  // ENTERPRISE: Request sync for missed messages
  const requestSync = useCallback((partnerId: string, lastSequence: number) => {
    emit('sync:request', { partnerId, lastSequence });
  }, [emit]);

  // ENTERPRISE: Send delivery ACK (called automatically by onNewMessage)
  const sendDeliveryAck = useCallback((messageId: string) => {
    emit('message:ack:delivered', { messageId });
  }, [emit]);

  useEffect(() => {
    connect();

    // Reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && !socketRef.current?.connected) {
        console.log('Tab visible, reconnecting WebSocket...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    emitTypingStart,
    emitTypingStop,
    emitMessageRead,
    requestSync,
    sendDeliveryAck,
    connect,
    disconnect,
  };
}
