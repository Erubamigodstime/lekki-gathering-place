import { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Loader2, Phone, Video, MoreVertical, Check, CheckCheck, Smile, Paperclip, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { toast } from 'sonner';

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
  const [allUsers, setAllUsers] = useState<UserContact[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserContact[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchAllUsersAndConversations();
    const interval = setInterval(fetchAllUsersAndConversations, 10000);
    return () => clearInterval(interval);
  }, [classId]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

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

  const fetchAllUsersAndConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all students in the class
      const [studentsResponse, conversationsResponse] = await Promise.all([
        axios.get(`${API_URL}/classes/${classId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const students = studentsResponse.data.data || [];
      const conversations = conversationsResponse.data.data || [];

      // Create a map of conversation data by partner ID
      const conversationMap = new Map();
      conversations.forEach((conv: any) => {
        conversationMap.set(conv.partnerId, {
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      });

      // Merge students with conversation data
      const usersWithMessages = students.map((student: any) => {
        const convData = conversationMap.get(student.user.id);
        return {
          id: student.user.id,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          profilePicture: student.user.profilePicture,
          role: 'Student',
          lastMessage: convData?.lastMessage,
          unreadCount: convData?.unreadCount || 0,
        };
      });

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

      // Update unread count
      const totalUnread = usersWithMessages.reduce((sum: number, user: UserContact) => sum + (user.unreadCount || 0), 0);
      onUnreadChange?.(totalUnread);
    } catch (error) {
      console.error('Failed to fetch users and conversations:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/thread/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.data || []);
      
      // Mark messages as read
      await axios.post(
        `${API_URL}/messages/thread/${partnerId}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/messages/direct`,
        {
          receiverId: selectedUser.id,
          content: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      await fetchMessages(selectedUser.id);
      await fetchAllUsersAndConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (user: UserContact) => {
    setSelectedUser(user);
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
      {/* Left Sidebar - All Students */}
      <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#f0f2f5] p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Students</h2>
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
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                {messages.length === 0 ? (
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
                  onChange={(e) => setNewMessage(e.target.value)}
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
              <p className="text-gray-600 text-lg">Select a student to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
