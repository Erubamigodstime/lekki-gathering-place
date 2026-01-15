import { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, User, Loader2, Plus, Check, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Conversation {
  partnerId: string;
  partner: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isFromMe: boolean;
    readAt: string | null;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface SearchUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  className?: string;
}

interface InstructorInboxPageProps {
  classId: string;
  onUnreadChange?: (count: number) => void;
}

export default function InstructorInboxPage({ classId, onUnreadChange }: InstructorInboxPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || '';

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.partnerId);
      const interval = setInterval(() => fetchMessages(selectedConversation.partnerId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convs = response.data.data || [];
      setConversations(convs);
      
      // Update unread count
      const totalUnread = convs.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      onUnreadChange?.(totalUnread);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
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
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/messages/direct`,
        {
          receiverId: selectedConversation.partnerId,
          content: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      await fetchMessages(selectedConversation.partnerId);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/search/users?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleStartNewChat = (user: SearchUser) => {
    const existingConversation = conversations.find(c => c.partnerId === user.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      setSelectedConversation({
        partnerId: user.id,
        partner: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          role: user.role,
        },
        lastMessage: {
          id: '',
          content: '',
          createdAt: new Date().toISOString(),
          isFromMe: false,
          readAt: null,
        },
        unreadCount: 0,
      });
      setMessages([]);
    }
    
    setShowNewChat(false);
    setUserSearchQuery('');
    setSearchUsers([]);
  };

  const filteredConversations = conversations.filter(conv => {
    const fullName = `${conv.partner.firstName} ${conv.partner.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <Button
              onClick={() => setShowNewChat(true)}
              size="sm"
              className="bg-gradient-to-r from-church-gold to-yellow-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start messaging your students by clicking the "New" button above
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.partnerId}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.partnerId === conversation.partnerId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.partner.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-church-gold to-yellow-600 text-white">
                      {getInitials(conversation.partner.firstName, conversation.partner.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.partner.firstName} {conversation.partner.lastName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.lastMessage.isFromMe && (
                          <span className="mr-1">
                            {conversation.lastMessage.readAt ? (
                              <CheckCheck className="inline h-3 w-3 text-blue-500" />
                            ) : (
                              <Check className="inline h-3 w-3 text-gray-400" />
                            )}
                          </span>
                        )}
                        {conversation.lastMessage.content || 'No messages yet'}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-church-gold text-white ml-2">
                          {conversation.unreadCount}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.partner.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-church-gold to-yellow-600 text-white">
                    {getInitials(selectedConversation.partner.firstName, selectedConversation.partner.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversation.partner.firstName} {selectedConversation.partner.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.partner.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromMe = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${isFromMe ? 'flex-row-reverse' : ''}`}>
                          {!isFromMe && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.profilePicture} />
                              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                {getInitials(message.sender.firstName, message.sender.lastName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`rounded-lg px-4 py-2 ${
                            isFromMe 
                              ? 'bg-gradient-to-r from-church-gold to-yellow-600 text-white' 
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isFromMe ? 'text-yellow-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
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
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-church-gold to-yellow-600"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the left or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-64">
              {searchingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-church-gold" />
                </div>
              ) : searchUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {userSearchQuery ? 'No students found' : 'Search for students to message'}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleStartNewChat(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className="bg-gradient-to-br from-church-gold to-yellow-600 text-white">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.className || user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
