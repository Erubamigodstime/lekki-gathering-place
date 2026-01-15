import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, User, Loader2, Phone, Video, MoreVertical, Check, CheckCheck, Smile, Paperclip, Mic, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface InboxPageProps {
  classId: string;
  preSelectedRecipient?: { id: string; name: string } | null;
  onClearRecipient?: () => void;
  onUnreadChange?: (count: number) => void;
}

export default function StudentInboxPage({ classId, preSelectedRecipient, onClearRecipient, onUnreadChange }: InboxPageProps) {
  const [allUsers, setAllUsers] = useState<UserContact[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserContact[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  // In-memory cache for messages by userId
  const messagesCache = useRef<{ [userId: string]: Message[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || '';
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // ✨ WebSocket connection for real-time messaging
  const { isConnected, emitTypingStart, emitTypingStop } = useSocket({
    onNewMessage: (message) => {
      // If message is from selected user, add to messages
      if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
        setMessages(prev => {
          const isDuplicate = prev.some(m => m.id === message.id);
          if (isDuplicate) return prev;
          const updated = [...prev, message].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          messagesCache.current[selectedUser.id] = updated;
          return updated;
        });
      }
      // Refresh conversation list
      fetchAllUsersAndConversations();
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

  const fetchMessages = useCallback(async (partnerId: string) => {
    setMessagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/thread/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Always sort by createdAt ascending
      const msgs = (response.data.data || []).slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      // Only update if different
      if (!areMessagesEqual(msgs, messagesCache.current[partnerId] || [])) {
        setMessages(msgs);
        messagesCache.current[partnerId] = msgs;
      }
      // Mark messages as read
      await axios.post(
        `${API_URL}/messages/thread/${partnerId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [areMessagesEqual]);

  useEffect(() => {
    fetchAllUsersAndConversations();
    
    // ✨ Reduced polling: only as fallback when WebSocket disconnected
    // If WebSocket is connected, no need to poll aggressively
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      // Poll every 30s if WebSocket connected (just to catch any missed updates)
      // Poll every 10s if WebSocket disconnected (fallback mode)
      const pollInterval = isConnected ? 30000 : 10000;
      interval = setInterval(fetchAllUsersAndConversations, pollInterval);
    };
    
    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };
    
    // Start polling initially
    startPolling();
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchAllUsersAndConversations(); // Refresh immediately when tab becomes visible
        startPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [classId, isConnected]);


  // Optimistically clear chat and show cached messages instantly
  useEffect(() => {
    if (selectedUser) {
      // Show cached messages instantly (if any)
      setMessages(messagesCache.current[selectedUser.id] || []);
      setMessagesLoading(true);
      fetchMessages(selectedUser.id);
      
      // ✨ Reduced polling: WebSocket handles real-time, polling is just backup
      let interval: NodeJS.Timeout;
      
      const startPolling = () => {
        // Poll every 60s if WebSocket connected (very light fallback)
        // Poll every 15s if WebSocket disconnected (fallback mode)
        const pollInterval = isConnected ? 60000 : 15000;
        interval = setInterval(() => fetchMessages(selectedUser.id), pollInterval);
      };
      
      const stopPolling = () => {
        if (interval) clearInterval(interval);
      };
      
      startPolling();
      
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          fetchMessages(selectedUser.id); // Refresh immediately
          startPolling();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      setMessages([]);
      setIsTyping(false);
    }
  }, [selectedUser, fetchMessages, isConnected]);

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

  useEffect(() => {
    // Handle pre-selected recipient
    if (preSelectedRecipient && allUsers.length > 0) {
      const user = allUsers.find(u => u.id === preSelectedRecipient.id);
      if (user) {
        setSelectedUser(user);
        onClearRecipient?.();
      }
    }
  }, [preSelectedRecipient, allUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAllUsersAndConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch class details to get instructors and fellow students
      const [classResponse, conversationsResponse] = await Promise.all([
        axios.get(`${API_URL}/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => {
          console.warn('Conversations endpoint failed, continuing with empty conversations:', err.message);
          return { data: { data: [] } };
        }),
      ]);

      const classData = classResponse.data.data;
      const conversations = conversationsResponse.data.data || [];
      
      console.log('Class data:', classData);
      console.log('Instructor:', classData.instructor);
      console.log('Enrollments:', classData.enrollments);
      console.log('Fetched conversations:', conversations.length);

      // Create a map of conversation data by partner ID
      const conversationMap = new Map();
      conversations.forEach((conv: any) => {
        conversationMap.set(conv.partnerId, {
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      });

      const users: UserContact[] = [];

      // Add instructor
      if (classData.instructor) {
        const convData = conversationMap.get(classData.instructor.userId);
        users.push({
          id: classData.instructor.userId,
          firstName: classData.instructor.user.firstName,
          lastName: classData.instructor.user.lastName,
          email: classData.instructor.user.email,
          profilePicture: classData.instructor.user.profilePicture,
          role: 'Instructor',
          lastMessage: convData?.lastMessage,
          unreadCount: convData?.unreadCount || 0,
        });
        console.log('Added instructor:', classData.instructor.user.firstName);
      }

      // Add classmates (other students) - filter approved enrollments only
      // Handle both array and paginated response structures
      let enrollmentsList = [];
      if (classData.enrollments) {
        // Check if it's a paginated response (has data property) or direct array
        enrollmentsList = Array.isArray(classData.enrollments) 
          ? classData.enrollments 
          : (classData.enrollments.data || []);
      }

      if (enrollmentsList.length > 0) {
        const approvedEnrollments = enrollmentsList.filter(
          (enrollment: any) => enrollment.status === 'APPROVED' && enrollment.student?.userId !== currentUserId
        );
        
        console.log('Total enrollments:', enrollmentsList.length);
        console.log('Approved enrollments (excluding self):', approvedEnrollments.length);
        
        approvedEnrollments.forEach((enrollment: any) => {
          if (enrollment.student?.user) {
            const convData = conversationMap.get(enrollment.student.userId);
            users.push({
              id: enrollment.student.userId,
              firstName: enrollment.student.user.firstName,
              lastName: enrollment.student.user.lastName,
              email: enrollment.student.user.email,
              profilePicture: enrollment.student.user.profilePicture,
              role: 'Student',
              lastMessage: convData?.lastMessage,
              unreadCount: convData?.unreadCount || 0,
            });
            console.log('Added classmate:', enrollment.student.user.firstName, enrollment.student.user.lastName);
          }
        });
      } else {
        console.warn('No enrollments found in class data');
      }

      // Sort by: instructor first, then unread messages, then by last message time, then by name
      users.sort((a: UserContact, b: UserContact) => {
        // Instructor always first
        if (a.role === 'Instructor' && b.role !== 'Instructor') return -1;
        if (a.role !== 'Instructor' && b.role === 'Instructor') return 1;

        // Unread messages
        if (a.unreadCount && !b.unreadCount) return -1;
        if (!a.unreadCount && b.unreadCount) return 1;
        
        // Last message time
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
        }
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && b.lastMessage) return 1;
        
        // Name
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      });

      setAllUsers(users);
      setFilteredUsers(users);
      
      console.log('Total users available for messaging:', users.length);
      console.log('Breakdown - Instructors:', users.filter(u => u.role === 'Instructor').length, 
                  'Students:', users.filter(u => u.role === 'Student').length);

      // Update unread count
      const totalUnread = users.reduce((sum: number, user: UserContact) => sum + (user.unreadCount || 0), 0);
      onUnreadChange?.(totalUnread);
    } catch (error: any) {
      console.error('Failed to fetch users and conversations:', error);
      
      if (error.response?.status === 404) {
        toast.error('Class not found');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load contacts');
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
      toast.success('Message sent');
      
      // Refresh messages and conversations
      await Promise.all([
        fetchMessages(selectedUser.id),
        fetchAllUsersAndConversations(),
      ]);
    } catch (error: any) {
      console.error('Failed to send message:', error.response?.data || error.message);
      
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
    setMessages([]); // Optimistically clear chat area instantly
    setMessagesLoading(true);
    // Reset unread count for this user locally
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, unreadCount: 0 } : u));
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
    <div className="flex h-screen bg-[#0a1628]">
      {/* Left Sidebar - All Contacts */}
      <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Real-time</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">Fallback</span>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search people..."
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
                {searchQuery ? 'No one found' : 'No contacts yet'}
              </h3>
              <p className="text-sm text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Your classmates and instructor will appear here'}
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
                      <AvatarFallback className={`font-semibold ${
                        user.role === 'Instructor' 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                          : 'bg-gradient-to-br from-church-gold to-yellow-600 text-white'
                      }`}>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold truncate ${
                          user.unreadCount ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.role === 'Instructor' && (
                          <Badge variant="secondary" className="text-xs py-0 h-4">
                            Instructor
                          </Badge>
                        )}
                      </div>
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
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.profilePicture} />
                  <AvatarFallback className={`font-semibold ${
                    selectedUser.role === 'Instructor'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                      : 'bg-gradient-to-br from-church-gold to-yellow-600 text-white'
                  }`}>
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {selectedUser.isOnline ? 'Online' : selectedUser.role}
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
                                message.readAt ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-gray-500" />
                                )
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
          <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
            <div className="text-center">
              <div className="bg-white rounded-full p-8 inline-block mb-4 shadow-lg">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Inbox</h3>
              <p className="text-gray-600 text-lg">Select a person to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
