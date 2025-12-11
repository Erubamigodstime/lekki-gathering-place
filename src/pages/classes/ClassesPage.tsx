import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Users, Clock, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockClasses = [
  {
    id: '1',
    name: 'Tailoring & Fashion Design',
    description: 'Learn the fundamentals of tailoring and fashion design, from basic stitching to creating complete garments.',
    instructor: { id: '1', name: 'Mary Johnson', avatar: '' },
    schedule: { days: ['Monday', 'Wednesday', 'Friday'], time: '9:00 AM - 11:00 AM' },
    capacity: 20,
    enrolled: 18,
    ward: 'Central Ward',
    status: 'active',
  },
  {
    id: '2',
    name: 'Culinary Arts Basics',
    description: 'Master the art of cooking with hands-on experience in various cuisines and cooking techniques.',
    instructor: { id: '2', name: 'Chef Roberts', avatar: '' },
    schedule: { days: ['Tuesday', 'Thursday'], time: '11:30 AM - 1:00 PM' },
    capacity: 15,
    enrolled: 15,
    ward: 'North Ward',
    status: 'active',
  },
  {
    id: '3',
    name: 'Music & Choir Training',
    description: 'Develop your musical talents through vocal training, music theory, and choir practice.',
    instructor: { id: '3', name: 'David Williams', avatar: '' },
    schedule: { days: ['Saturday'], time: '2:00 PM - 5:00 PM' },
    capacity: 25,
    enrolled: 22,
    ward: 'All Wards',
    status: 'active',
  },
  {
    id: '4',
    name: 'Photography Basics',
    description: 'Learn photography fundamentals including composition, lighting, and post-processing.',
    instructor: { id: '4', name: 'James Wilson', avatar: '' },
    schedule: { days: ['Monday', 'Wednesday'], time: '3:00 PM - 5:00 PM' },
    capacity: 12,
    enrolled: 8,
    ward: 'South Ward',
    status: 'active',
  },
];

const wards = ['All Wards', 'Central Ward', 'North Ward', 'South Ward', 'East Ward', 'West Ward'];

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredClasses = mockClasses.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'all' || cls.ward === wardFilter;
    return matchesSearch && matchesWard;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground mt-1">Manage all skill training classes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="church">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Create New Class</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new skill training class.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="className">Class Name</Label>
                <Input id="className" placeholder="e.g., Tailoring & Fashion Design" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe what students will learn..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mary Johnson</SelectItem>
                      <SelectItem value="2">Chef Roberts</SelectItem>
                      <SelectItem value="3">David Williams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Max Capacity</Label>
                  <Input id="capacity" type="number" placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map(ward => (
                        <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" placeholder="e.g., 9:00 AM - 11:00 AM" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button variant="church" onClick={() => setIsCreateDialogOpen(false)}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes or instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Wards</SelectItem>
            {wards.filter(w => w !== 'All Wards').map(ward => (
              <SelectItem key={ward} value={ward}>{ward}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls, index) => (
          <Card 
            key={cls.id} 
            className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-1">{cls.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{cls.ward}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Class
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cls.description}</p>
              
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={cls.instructor.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {cls.instructor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{cls.instructor.name}</p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{cls.schedule.days.join(', ')} • {cls.schedule.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{cls.enrolled}/{cls.capacity} students</span>
                  </div>
                  {cls.enrolled >= cls.capacity && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">Full</Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {Math.round((cls.enrolled / cls.capacity) * 100)}% capacity
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No classes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
