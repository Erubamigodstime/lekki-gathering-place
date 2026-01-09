import { Clock, MapPin, Users, Loader2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClassItem {
  id: string;
  name: string;
  instructor: {
    user?: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
    name?: string;
    avatar?: string;
  };
  schedule?: {
    time?: string;
    days?: string[];
  };
  time?: string;
  location?: string;
  _count?: {
    enrollments: number;
  };
  maxCapacity?: number;
  enrolled?: number;
  capacity?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'ACTIVE' | 'INACTIVE';
}

interface TodayClassesCardProps {
  classes: ClassItem[];
  loading?: boolean;
}

export function TodayClassesCard({ classes, loading = false }: TodayClassesCardProps) {
  const getStatusBadge = (status: ClassItem['status']) => {
    switch (status) {
      case 'upcoming':
      case 'ACTIVE':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>;
      case 'ongoing':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Ongoing</Badge>;
      case 'completed':
      case 'INACTIVE':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Inactive</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading today's classes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Classes Today</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              There are no classes scheduled for today. Check back on class days.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem, index) => {
              const instructorName = classItem.instructor?.user 
                ? `${classItem.instructor.user.firstName} ${classItem.instructor.user.lastName}`
                : classItem.instructor?.name || 'No Instructor Assigned';
              
              const instructorAvatar = classItem.instructor?.user?.profilePicture || classItem.instructor?.avatar;
              const time = classItem.schedule?.time || classItem.time || 'Time TBA';
              const enrolled = classItem._count?.enrollments || classItem.enrolled || 0;
              const capacity = classItem.maxCapacity || classItem.capacity || 0;

              return (
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
                          <AvatarImage src={instructorAvatar} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {instructorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{instructorName}</span>
                      </div>
                    </div>
                    {getStatusBadge(classItem.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{enrolled}/{capacity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
