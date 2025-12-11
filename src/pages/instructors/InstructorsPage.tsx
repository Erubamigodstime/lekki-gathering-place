import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Check, X, Eye, Mail, Phone, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const mockInstructors = [
  {
    id: '1',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@church.org',
    phone: '+1234567890',
    ward: 'Central Ward',
    skills: ['Tailoring', 'Fashion Design', 'Sewing'],
    status: 'approved',
    classesCount: 2,
    studentsCount: 35,
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Williams',
    email: 'david.williams@church.org',
    phone: '+1234567891',
    ward: 'North Ward',
    skills: ['Music Theory', 'Choir Training', 'Piano'],
    status: 'approved',
    classesCount: 3,
    studentsCount: 45,
    joinedAt: '2024-02-20',
  },
  {
    id: '3',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@church.org',
    phone: '+1234567892',
    ward: 'South Ward',
    skills: ['Photography', 'Video Editing'],
    status: 'pending',
    classesCount: 0,
    studentsCount: 0,
    joinedAt: '2024-12-01',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@church.org',
    phone: '+1234567893',
    ward: 'East Ward',
    skills: ['Cooking', 'Baking', 'Nutrition'],
    status: 'pending',
    classesCount: 0,
    studentsCount: 0,
    joinedAt: '2024-12-05',
  },
];

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredInstructors = mockInstructors.filter(instructor => {
    const fullName = `${instructor.firstName} ${instructor.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesWard = wardFilter === 'all' || instructor.ward === wardFilter;
    const matchesTab = activeTab === 'all' || instructor.status === activeTab;
    return matchesSearch && matchesWard && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = mockInstructors.filter(i => i.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Instructors</h1>
          <p className="text-muted-foreground mt-1">Manage and approve instructor applications</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Instructors</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or skill..."
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
            <SelectItem value="Central Ward">Central Ward</SelectItem>
            <SelectItem value="North Ward">North Ward</SelectItem>
            <SelectItem value="South Ward">South Ward</SelectItem>
            <SelectItem value="East Ward">East Ward</SelectItem>
            <SelectItem value="West Ward">West Ward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instructors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstructors.map((instructor, index) => (
          <Card 
            key={instructor.id}
            className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {instructor.firstName[0]}{instructor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {instructor.firstName} {instructor.lastName}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {instructor.ward}
                    </div>
                  </div>
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
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </DropdownMenuItem>
                    {instructor.status === 'pending' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600">
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{instructor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{instructor.phone}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {instructor.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                {getStatusBadge(instructor.status)}
                
                {instructor.status === 'approved' && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{instructor.classesCount} classes</span>
                    </div>
                    <span>{instructor.studentsCount} students</span>
                  </div>
                )}

                {instructor.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-600 hover:bg-green-50">
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive hover:bg-destructive/10">
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No instructors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
