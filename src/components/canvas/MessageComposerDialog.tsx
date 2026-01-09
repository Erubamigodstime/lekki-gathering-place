import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { messageApi } from '@/utils/canvas-api';
import { Send } from 'lucide-react';

const messageSchema = z.object({
  type: z.enum(['DIRECT', 'CLASS', 'BROADCAST']),
  recipientId: z.string().optional(),
  classId: z.string().optional(),
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: string;
  recipientId?: string;
  recipientName?: string;
  onSuccess: () => void;
}

export function MessageComposerDialog({
  open,
  onOpenChange,
  classId,
  recipientId,
  recipientName,
  onSuccess,
}: MessageComposerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState<'DIRECT' | 'CLASS' | 'BROADCAST'>(
    recipientId ? 'DIRECT' : classId ? 'CLASS' : 'BROADCAST'
  );
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: messageType,
      recipientId,
      classId,
    },
  });

  useEffect(() => {
    setValue('type', messageType);
    if (messageType === 'CLASS') {
      setValue('classId', classId);
      setValue('recipientId', undefined);
    } else if (messageType === 'DIRECT') {
      setValue('recipientId', recipientId);
      setValue('classId', undefined);
    } else {
      setValue('classId', undefined);
      setValue('recipientId', undefined);
    }
  }, [messageType, classId, recipientId, setValue]);

  const onSubmit = async (data: MessageFormData) => {
    try {
      setIsLoading(true);
      await messageApi.send({
        type: data.type,
        subject: data.subject,
        body: data.body,
        recipientId: data.type === 'DIRECT' ? data.recipientId : undefined,
        classId: data.type === 'CLASS' ? data.classId : undefined,
      });

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            {messageType === 'DIRECT' && recipientName
              ? `Send a direct message to ${recipientName}`
              : messageType === 'CLASS'
              ? 'Send a message to all class members'
              : 'Send a broadcast message to all users'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!recipientId && !classId && (
            <div className="space-y-2">
              <Label htmlFor="type">Message Type</Label>
              <Select
                value={messageType}
                onValueChange={(value: any) => setMessageType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECT">Direct Message</SelectItem>
                  <SelectItem value="CLASS">Class Message</SelectItem>
                  <SelectItem value="BROADCAST">Broadcast to All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {messageType === 'DIRECT' && !recipientId && (
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient ID</Label>
              <Input
                id="recipientId"
                {...register('recipientId')}
                placeholder="Enter recipient user ID"
              />
              {errors.recipientId && (
                <p className="text-sm text-destructive">{errors.recipientId.message}</p>
              )}
            </div>
          )}

          {messageType === 'CLASS' && !classId && (
            <div className="space-y-2">
              <Label htmlFor="classId">Class ID</Label>
              <Input
                id="classId"
                {...register('classId')}
                placeholder="Enter class ID"
              />
              {errors.classId && (
                <p className="text-sm text-destructive">{errors.classId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Message subject"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              {...register('body')}
              placeholder="Type your message here..."
              rows={8}
              className="resize-none"
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
