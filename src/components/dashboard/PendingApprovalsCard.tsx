import { Check, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PendingItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    email: string;
  };
  type: 'instructor' | 'enrollment' | 'attendance';
  details: string;
  requestedAt: string;
}

interface PendingApprovalsCardProps {
  items: PendingItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function PendingApprovalsCard({ items, onApprove, onReject, onView }: PendingApprovalsCardProps) {
  const getTypeBadge = (type: PendingItem['type']) => {
    switch (type) {
      case 'instructor':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Instructor</Badge>;
      case 'enrollment':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Enrollment</Badge>;
      case 'attendance':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Attendance</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
        <Badge variant="outline" className="text-primary border-primary">
          {items.length} pending
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={item.user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {item.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{item.user.name}</span>
                  {getTypeBadge(item.type)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.details}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.requestedAt}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onView?.(item.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-green-600 hover:bg-green-100"
                  onClick={() => onApprove?.(item.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => onReject?.(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
