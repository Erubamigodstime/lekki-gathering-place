import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, User, Loader2, Phone, Video, MoreVertical, Check, CheckCheck, Smile, Paperclip, Mic, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface UserContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
    readAt: string | null;
  };
  unreadCount?: number;
  isOnline?: boolean;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  readAt?: string | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface InstructorInboxPageProps {
  classId: string;
  onUnreadChange?: (count: number) => void;
}

export default function InstructorInboxPage({ classId, onUnreadChange }: InstructorInboxPageProps) {
  // ✨ ENTERPRISE: Initialize with cached data for instant display
  const getCachedUsers = () => {
    try {
      const cached = sessionStorage.getItem(`inbox-users-${classId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const getCachedMessages = (userId: string): Message[] => {
    try {
      const cached = sessionStorage.getItem(`inbox-messages-${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const setCachedMessages = (userId: string, messages: Message[]) => {
    try {
      sessionStorage.setItem(`inbox-messages-${userId}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to cache messages:', e);
    }
  };

  const [allUsers, setAllUsers] = useState<UserContact[]>(getCachedUsers());
  const [filteredUsers, setFilteredUsers] = useState<UserContact[]>(getCachedUsers());
  const [selectedUser, setSelectedUser] = useState<UserContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  // In-memory cache for messages by userId - initialized with sessionStorage
  const messagesCache = useRef<{ [userId: string]: Message[] }>({});
  // ENTERPRISE: Track last sequence number per conversation for sync
  const lastSequenceRef = useRef<{ [conversationId: string]: number }>({});
  const conversationIdRef = useRef<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(getCachedUsers().length === 0); // Only show loading if no cache
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // ENTERPRISE: Message delivery status tracking
  const [messageStatuses, setMessageStatuses] = useState<{ [id: string]: 'sent' | 'delivered' | 'read' }>({});
  // ENTERPRISE: Mobile-responsive state for WhatsApp-like UX
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || '';
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // ✨ ENTERPRISE WebSocket connection: Pure real-time, NO polling!
  const { isConnected, emitTypingStart, emitTypingStop, requestSync, sendDeliveryAck } = useSocket({
    onNewMessage: (message) => {
      // Update last sequence number
      if (message.conversationId && message.sequenceNumber) {
        lastSequenceRef.current[message.conversationId] = message.sequenceNumber;
      }

      // If message is from selected user, add to messages
      if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages(prev => {
          const isDuplicate = prev.some(m => m.id === message.id);
          if (isDuplicate) return prev;
          const updated = [...prev, message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          messagesCache.current[selectedUser.id] = updated;
          // ✨ ENTERPRISE: Persist to sessionStorage
          setCachedMessages(selectedUser.id, updated);
          return updated;
        });
      }
      // Refresh conversation list (WebSocket event will update it)
      fetchAllUsersAndConversations(false);
    },
    onDeliveryReceipt: (receipt) => {
      // Update message status with delivery/read receipt
      setMessageStatuses(prev => ({
        ...prev,
        [receipt.messageId]: receipt.status,
      }));
    },
    onSyncResponse: (syncData) => {
      // Handle missed messages after reconnection
      if (syncData.messages && syncData.messages.length > 0) {
        console.log(`Synced ${syncData.messages.length} missed messages`);
        
        // Add missed messages to current conversation if it matches
        if (selectedUser) {
          setMessages(prev => {
            const combined = [...prev, ...syncData.messages];
            // Remove duplicates and sort
            const unique = combined.filter((msg, index, self) => 
              self.findIndex(m => m.id === msg.id) === index
            ).sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            messagesCache.current[selectedUser.id] = unique;
            return unique;
          });
        }
      }

      // Update last sequence
      if (syncData.currentSequence && conversationIdRef.current) {
        lastSequenceRef.current[conversationIdRef.current] = syncData.currentSequence;
      }
    },
    onTypingStart: (data) => {
      if (selectedUser && data.senderId === selectedUser.id) {
        setIsTyping(true);
      }
    },
    onTypingStop: (data) => {
      if (selectedUser && data.senderId === selectedUser.id) {
        setIsTyping(false);
      }
    },
    onUserStatus: (data) => {
      // Update user online status
      setAllUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, isOnline: data.isOnline } : user
      ));
    },
  });

  // Deep equality check for messages array
  const areMessagesEqual = useCallback((a: Message[], b: Message[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id || a[i].content !== b[i].content || a[i].createdAt !== b[i].createdAt || a[i].senderId !== b[i].senderId || a[i].receiverId !== b[i].receiverId) {
        return false;
      }
    }
    return true;
  }, []);

  const fetchMessages = useCallback(async (partnerId: string, showLoading = true) => {
    // Only show loading if explicitly requested and no cache exists
    if (showLoading && !messagesCache.current[partnerId]) {
      setMessagesLoading(true);
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/thread/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle response - could be messages array or object with messages
      const responseData = response.data.data;
      const msgs = Array.isArray(responseData) 
        ? responseData 
        : (responseData.messages || []);
      
      // Sort by createdAt ascending
      const sortedMsgs = msgs.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      // ENTERPRISE: Store conversation ID and last sequence number
      if (responseData.conversationId || response.data.conversationId) {
        conversationIdRef.current = responseData.conversationId || response.data.conversationId;
      }
      if (responseData.currentSequence || response.data.currentSequence) {
        const convId = responseData.conversationId || response.data.conversationId;
        lastSequenceRef.current[convId] = responseData.currentSequence || response.data.currentSequence;
      }

      // Only update if different
      if (!areMessagesEqual(sortedMsgs, messagesCache.current[partnerId] || [])) {
        setMessages(sortedMsgs);
        messagesCache.current[partnerId] = sortedMsgs;
        // ✨ ENTERPRISE: Persist to sessionStorage for instant display next time
        setCachedMessages(partnerId, sortedMsgs);
        
        // Initialize message statuses
        const statuses: { [id: string]: 'sent' | 'delivered' | 'read' } = {};
        msgs.forEach(msg => {
          if (msg.readAt) {
            statuses[msg.id] = 'read';
          } else if (msg.deliveredAt) {
            statuses[msg.id] = 'delivered';
          } else {
            statuses[msg.id] = 'sent';
          }
        });
        setMessageStatuses(statuses);
      }
      
      // Mark messages as read
      await axios.post(
        `${API_URL}/messages/thread/${partnerId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(() => {
        // ✨ ENTERPRISE: Refresh conversation list to update unread counts
        fetchAllUsersAndConversations(false);
      }).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [areMessagesEqual]);

  useEffect(() => {
    // ✨ ENTERPRISE: Show cached data instantly, refresh in background
    const hasCached = getCachedUsers().length > 0;
    fetchAllUsersAndConversations(!hasCached); // Only show loading if no cache
    
    // ✨ ENTERPRISE: NO POLLING! WebSocket handles all real-time updates
    // Only refresh on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllUsersAndConversations(false); // Silent background refresh
        
        // ENTERPRISE: Request sync for missed messages if we have a conversation
        if (conversationIdRef.current && selectedUser) {
          const lastSeq = lastSequenceRef.current[conversationIdRef.current] || 0;
          requestSync(selectedUser.id, lastSeq);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [classId, selectedUser, requestSync]);


  // Optimistically clear chat and show cached messages instantly
  useEffect(() => {
    if (selectedUser) {
      // ✨ ENTERPRISE: Load from sessionStorage first, then in-memory cache
      let cachedMessages = messagesCache.current[selectedUser.id];
      if (!cachedMessages || cachedMessages.length === 0) {
        cachedMessages = getCachedMessages(selectedUser.id);
        if (cachedMessages.length > 0) {
          messagesCache.current[selectedUser.id] = cachedMessages;
        }
      }
      
      // Show cached messages instantly - ZERO loading state
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setMessagesLoading(false);
        // Silent background refresh
        fetchMessages(selectedUser.id, false);
      } else {
        // No cache, show loading and fetch
        setMessages([]);
        setMessagesLoading(true);
        fetchMessages(selectedUser.id, true);
      }
      
      // ✨ ENTERPRISE: NO POLLING! WebSocket provides real-time updates
      // Refresh only when user returns to the page
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          // Request sync for any missed messages
          if (conversationIdRef.current) {
            const lastSeq = lastSequenceRef.current[conversationIdRef.current] || 0;
            requestSync(selectedUser.id, lastSeq);
          }
          // Also refresh from API as backup - silent background refresh
          fetchMessages(selectedUser.id, false);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      setMessages([]);
      setIsTyping(false);
      conversationIdRef.current = null;
    }
  }, [selectedUser, fetchMessages, requestSync]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAllUsersAndConversations = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!classId) {
        console.error('No classId provided to InstructorInboxPage');
        toast.error('Class information missing');
        setLoading(false);
        return;
      }

      console.log('Fetching students for classId:', classId);
      
      // Fetch all enrollments (students) in the class
      const [enrollmentsResponse, conversationsResponse] = await Promise.all([
        axios.get(`${API_URL}/enrollments/class/${classId}?status=APPROVED`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => {
          console.warn('Conversations endpoint failed, continuing with empty conversations:', err.message);
          return { data: { data: { data: [] } } };
        }),
      ]);

      // Handle paginated enrollment response
      const enrollmentsData = enrollmentsResponse.data.data;
      const enrollments = Array.isArray(enrollmentsData) 
        ? enrollmentsData 
        : (enrollmentsData?.data || []);
      
      // Extract conversations array from nested response structure
      const conversationsData = conversationsResponse.data.data;
      const conversations = Array.isArray(conversationsData) 
        ? conversationsData 
        : (conversationsData?.data || []);

      console.log('Fetched enrollments:', enrollments.length);
      console.log('Fetched conversations:', conversations.length);

      // Create a map of conversation data by partner ID
      const conversationMap = new Map();
      conversations.forEach((conv: any) => {
        conversationMap.set(conv.partnerId, {
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      });

      // Merge enrollments with conversation data - ensure enrollments is an array
      const usersWithMessages = Array.isArray(enrollments) ? enrollments.map((enrollment: any) => {
        const convData = conversationMap.get(enrollment.student.user.id);
        return {
          id: enrollment.student.user.id,
          firstName: enrollment.student.user.firstName,
          lastName: enrollment.student.user.lastName,
          email: enrollment.student.user.email,
          profilePicture: enrollment.student.user.profilePicture,
          role: 'Student',
          lastMessage: convData?.lastMessage,
          unreadCount: convData?.unreadCount || 0,
        };
      }) : [];

      // Sort by: unread messages first, then by last message time, then by name
      usersWithMessages.sort((a: UserContact, b: UserContact) => {
        // Unread messages first
        if (a.unreadCount && !b.unreadCount) return -1;
        if (!a.unreadCount && b.unreadCount) return 1;
        
        // Then by last message time
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
        }
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && b.lastMessage) return 1;
        
        // Finally by name
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      });

      setAllUsers(usersWithMessages);
      setFilteredUsers(usersWithMessages);

      // ✨ ENTERPRISE: Cache users data for instant display next time
      try {
        sessionStorage.setItem(`inbox-users-${classId}`, JSON.stringify(usersWithMessages));
      } catch (e) {
        console.warn('Failed to cache users:', e);
      }

      // Update unread count
      const totalUnread = usersWithMessages.reduce((sum: number, user: UserContact) => sum + (user.unreadCount || 0), 0);
      onUnreadChange?.(totalUnread);
    } catch (error: any) {
      console.error('Failed to fetch users and conversations:', error);
      
      if (error.response?.status === 429) {
        console.warn('Rate limited - reducing request frequency');
        // Don't show error toast for rate limiting during background refresh
      } else if (error.message) {
        toast.error(error.message);
      } else if (error.response?.status === 404) {
        toast.error('Class not found or you are not enrolled as an instructor');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load contacts. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      sender: {
        id: currentUserId,
        firstName: 'You',
        lastName: '',
      },
    };
    
    // Add message to UI immediately (optimistic update)
    setMessages(prev => {
      const updated = [...prev, optimisticMessage];
      messagesCache.current[selectedUser.id] = updated;
      return updated;
    });

    // ENTERPRISE: Set initial status as 'sent'
    setMessageStatuses(prev => ({ ...prev, [tempId]: 'sent' }));
    
    try {
      const token = localStorage.getItem('token');
      console.log('Sending message to:', selectedUser.id, 'Content:', messageContent);
      
      const response = await axios.post(
        `${API_URL}/messages/direct`,
        {
          receiverId: selectedUser.id,
          content: messageContent,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          } 
        }
      );

      console.log('Message sent successfully:', response.data);
      
      // Replace optimistic message with real one from server
      const realMessage = response.data.data;
      
      // ENTERPRISE: Update sequence number tracking
      if (realMessage.conversationId && realMessage.sequenceNumber) {
        lastSequenceRef.current[realMessage.conversationId] = realMessage.sequenceNumber;
        if (!conversationIdRef.current) {
          conversationIdRef.current = realMessage.conversationId;
        }
      }

      setMessages(prev => {
        const updated = prev.map(msg => 
          msg.id === tempId ? realMessage : msg
        );
        messagesCache.current[selectedUser.id] = updated;
        return updated;
      });

      // Update status with real message ID
      setMessageStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[tempId]; // Remove temp ID
        newStatuses[realMessage.id] = 'sent'; // Real message starts as 'sent'
        return newStatuses;
      });
      
      // Refresh conversations list in background (don't await)
      fetchAllUsersAndConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error.response?.data || error.message);
      
      // Remove optimistic message on failure
      setMessages(prev => {
        const updated = prev.filter(msg => msg.id !== tempId);
        messagesCache.current[selectedUser.id] = updated;
        return updated;
      });
      
      // Remove failed status
      setMessageStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[tempId];
        return newStatuses;
      });
      
      // Restore the message if send failed
      setNewMessage(messageContent);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('Recipient not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send message');
      }
    } finally {
      setSending(false);
      // Stop typing indicator
      if (selectedUser) {
        emitTypingStop(selectedUser.id);
      }
    }
  };

  // Handle typing indicator
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (selectedUser && e.target.value.trim()) {
      // Emit typing start
      emitTypingStart(selectedUser.id);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Emit typing stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStop(selectedUser.id);
      }, 2000);
    } else if (selectedUser) {
      emitTypingStop(selectedUser.id);
    }
  };

  const handleUserSelect = (user: UserContact) => {
    setSelectedUser(user);
    // Don't clear messages - useEffect will handle showing cached/fetching
    // Reset unread count for this user locally
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
    // ENTERPRISE: Open chat view on mobile with animation
    setIsMobileChatOpen(true);
  };

  // ENTERPRISE: Handle mobile back navigation
  const handleMobileBack = () => {
    setIsMobileChatOpen(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a1628] relative overflow-hidden">
      {/* Left Sidebar - All Students */}
      {/* On mobile: Full width, hidden when chat is open */}
      {/* On desktop: Fixed width 380px, always visible */}
      <div className={`
        w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col
        absolute md:relative inset-0 z-20 md:z-auto
        transition-transform duration-500 ease-in-out
        ${isMobileChatOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Header */}
        <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Students</h2>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white rounded-lg border-gray-300"
            />
          </div>
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-sm text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Students will appear here once they enroll'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === user.id ? 'bg-[#f0f2f5]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-church-gold to-yellow-600 text-white font-semibold">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${
                        user.unreadCount ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {user.firstName} {user.lastName}
                      </h3>
                      {user.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(user.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {user.lastMessage ? (
                        <p className={`text-sm truncate flex-1 ${
                          user.unreadCount ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {user.lastMessage.isFromMe && (
                            <span className="mr-1">
                              {user.lastMessage.readAt ? (
                                <CheckCheck className="inline h-3 w-3 text-blue-500" />
                              ) : (
                                <Check className="inline h-3 w-3 text-gray-400" />
                              )}
                            </span>
                          )}
                          {user.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 truncate flex-1">
                          No messages yet
                        </p>
                      )}
                      
                      {user.unreadCount && user.unreadCount > 0 && (
                        <Badge className="bg-church-gold text-white ml-2 min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full">
                          {user.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right Chat Area */}
      {/* On mobile: Full width, slides in from right when chat is open */}
      {/* On desktop: Flex-1, always visible */}
      <div className={`
        flex-1 flex flex-col bg-[#e5ddd5]
        absolute md:relative inset-0 z-30 md:z-auto
        transition-transform duration-500 ease-in-out
        ${isMobileChatOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMobileBack}
                  className="md:hidden text-gray-600 hover:text-gray-900 -ml-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-church-gold to-yellow-600 text-white font-semibold">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" style={{ backgroundImage: 'url("/chat-bg.png")', backgroundSize: 'cover' }}>
              <div className="space-y-2 max-w-5xl mx-auto">
                {messagesLoading ? (
                  // Skeleton loader for chat area
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex justify-start animate-pulse">
                      <div className="max-w-[65%] mr-auto">
                        <div className="rounded-lg px-3 py-4 bg-gray-200 mb-2 w-40 h-4" />
                      </div>
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 inline-block shadow-sm">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Start the conversation!</p>
                      <p className="text-sm text-gray-500 mt-1">Send a message to {selectedUser.firstName}</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromMe = message.senderId === currentUserId;
                    // Debug logging
                    if (messages.indexOf(message) === 0) {
                      console.log('Instructor Current User ID:', currentUserId);
                      console.log('Message Sender ID:', message.senderId);
                      console.log('Is From Me:', isFromMe);
                    }
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[65%] ${isFromMe ? 'ml-auto' : 'mr-auto'}`}>
                          <div className={`rounded-lg px-3 py-2 shadow-sm ${
                            isFromMe 
                              ? 'bg-[#dcf8c6] text-gray-900' 
                              : 'bg-white text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {message.content}
                            </p>
                            <div className={`flex items-center justify-end gap-1 mt-1`}>
                              <span className="text-[10px] text-gray-600">
                                {formatTime(message.createdAt)}
                              </span>
                              {isFromMe && (
                                (() => {
                                  const status = messageStatuses[message.id] || 'sent';
                                  if (status === 'read') {
                                    // Double blue checkmarks (read)
                                    return <CheckCheck className="h-3 w-3 text-blue-500" />;
                                  } else if (status === 'delivered') {
                                    // Double gray checkmarks (delivered but not read)
                                    return <CheckCheck className="h-3 w-3 text-gray-500" />;
                                  } else {
                                    // Single gray checkmark (sent)
                                    return <Check className="h-3 w-3 text-gray-500" />;
                                  }
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-[#f0f2f5] px-4 py-3 border-t border-gray-200">
              <div className="flex items-end gap-2 max-w-5xl mx-auto">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 mb-1">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 mb-1">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Textarea
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none bg-white rounded-lg border-gray-300 min-h-[42px] max-h-[120px]"
                  rows={1}
                />
                {newMessage.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending}
                    size="icon"
                    className="bg-church-gold hover:bg-yellow-600 text-white mb-1"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 mb-1">
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state - only visible on desktop */
          <div className="flex-1 hidden md:flex items-center justify-center bg-[#f8f9fa]">
            <div className="text-center">
              <div className="bg-white rounded-full p-8 inline-block mb-4 shadow-lg">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Inbox</h3>
              <p className="text-gray-600 text-lg">Select a student to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
