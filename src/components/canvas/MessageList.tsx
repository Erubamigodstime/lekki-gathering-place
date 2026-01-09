import { useState, useEffect } from 'react';
import { MessageSquare, Send, Inbox, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { messageApi } from '@/utils/canvas-api';
import type { Message } from '@/types/canvas';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MessageComposerDialog } from './MessageComposerDialog';

interface MessageListProps {
  classId: string;
}

export function MessageList({ classId }: MessageListProps) {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [classMessages, setClassMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [classId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const [inboxData, sentData, classData, unread] = await Promise.all([
        messageApi.getInbox(),
        messageApi.getSent(),
        messageApi.getClassMessages(classId),
        messageApi.getUnreadCount(),
      ]);
      setInbox(inboxData);
      setSent(sentData);
      setClassMessages(classData);
      setUnreadCount(unread);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageApi.markRead(messageId);
      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to mark message as read',
        variant: 'destructive',
      });
    }
  };

  const MessageCard = ({ message, type }: { message: Message; type: 'inbox' | 'sent' | 'class' }) => (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${!message.isRead && type === 'inbox' ? 'border-primary' : ''}`}
      onClick={() => type === 'inbox' && !message.isRead && handleMarkAsRead(message.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={message.type === 'DIRECT' ? 'default' : 'secondary'}>
                {message.type}
              </Badge>
              {!message.isRead && type === 'inbox' && (
                <Badge variant="destructive">Unread</Badge>
              )}
            </div>
            <CardTitle className="text-base">{message.subject}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {type === 'inbox' ? `From: ${message.sender?.firstName} ${message.sender?.lastName}` : 
               type === 'sent' ? `To: ${message.recipient?.firstName} ${message.recipient?.lastName}` :
               `From: ${message.sender?.firstName} ${message.sender?.lastName}`}
            </p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{message.body}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Messages</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} Unread</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowComposer(true)}>
          <Send className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Message Composer Dialog */}
      <MessageComposerDialog
        open={showComposer}
        onOpenChange={setShowComposer}
        classId={classId}
        onSuccess={() => {
          setShowComposer(false);
          fetchMessages();
        }}
      />

      <Tabs defaultValue="class" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="class">
            <MessageSquare className="h-4 w-4 mr-2" />
            Class
          </TabsTrigger>
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent">
            <SendHorizonal className="h-4 w-4 mr-2" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-4">
          {classMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No class messages</p>
              </CardContent>
            </Card>
          ) : (
            classMessages.map((message) => (
              <MessageCard key={message.id} message={message} type="class" />
            ))
          )}
        </TabsContent>

        <TabsContent value="inbox" className="space-y-4">
          {inbox.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages in inbox</p>
              </CardContent>
            </Card>
          ) : (
            inbox.map((message) => (
              <MessageCard key={message.id} message={message} type="inbox" />
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <SendHorizonal className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sent messages</p>
              </CardContent>
            </Card>
          ) : (
            sent.map((message) => (
              <MessageCard key={message.id} message={message} type="sent" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
