import { Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClassItem {
  id: string;
  name: string;
  instructor: {
    name: string;
    avatar?: string;
  };
  time: string;
  location: string;
  enrolled: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface TodayClassesCardProps {
  classes: ClassItem[];
}

export function TodayClassesCard({ classes }: TodayClassesCardProps) {
  const getStatusBadge = (status: ClassItem['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Completed</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
        <Button variant="ghost" className="text-primary text-sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.map((classItem, index) => (
            <div 
              key={classItem.id}
              className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{classItem.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={classItem.instructor.avatar} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {classItem.instructor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{classItem.instructor.name}</span>
                  </div>
                </div>
                {getStatusBadge(classItem.status)}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{classItem.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{classItem.enrolled}/{classItem.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
