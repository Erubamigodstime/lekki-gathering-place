import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Activity } from 'lucide-react';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  time: string;
  type: 'enrollment' | 'attendance' | 'approval' | 'class';
}

interface RecentActivityCardProps {
  activities: Activity[];
  loading?: boolean;
}

export function RecentActivityCard({ activities, loading = false }: RecentActivityCardProps) {
  const getTypeBadge = (type: Activity['type']) => {
    switch (type) {
      case 'enrollment':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Enrollment</Badge>;
      case 'attendance':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Attendance</Badge>;
      case 'approval':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Approval</Badge>;
      case 'class':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Class</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <Activity className="h-7 w-7 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">No Activity Yet</h4>
            <p className="text-sm text-muted-foreground text-center max-w-xs">Recent activities from your classes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex items-start gap-4 animate-slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{activity.user.name}</span>
                  {getTypeBadge(activity.type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} <span className="font-medium text-foreground">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
