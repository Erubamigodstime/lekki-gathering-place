import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Users, Clock, MapPin, Edit, Trash2, Eye, BookOpen, Loader2, Mail, Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Class {
  id: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  schedule?: {
    days: string[];
    startTime?: string;
    endTime?: string;
  };
  maxCapacity: number;
  _count?: {
    enrollments: number;
  };
  ward: {
    id: string;
    name: string;
  };
  status: string;
}

export default function ClassesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if this is the "My Classes" page for instructors
  const isMyClassesPage = location.pathname === '/my-classes';

  useEffect(() => {
    fetchClasses();
    fetchWards();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      
      // If instructor on My Classes page, fetch only their classes
      let url = `${API_URL}/classes`;
      if (isMyClassesPage && user?.role?.toUpperCase() === 'INSTRUCTOR') {
        console.log('Fetching instructor classes...');
        console.log('User object:', user);
        
        try {
          // Get instructor profile first
          const profileRes = await axios.get(`${API_URL}/instructors/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Instructor profile:', profileRes.data);
          const instructorId = profileRes.data.data.id;
          console.log('Instructor ID:', instructorId);
          url = `${API_URL}/classes?instructorId=${instructorId}`;
          console.log('Fetching from URL:', url);
        } catch (profileError) {
          console.error('Failed to fetch instructor profile:', profileError);
          // If instructor profile doesn't exist, show empty state
          setClasses([]);
          setLoading(false);
          return;
        }
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Classes API Response:', response.data);
      console.log('Response data.data:', response.data.data);
      
      // Handle paginated response structure: { data: { data: [...], pagination: {...} } }
      const responseData = response.data.data;
      let classesArray = [];
      
      if (Array.isArray(responseData)) {
        // Direct array response
        classesArray = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        // Paginated response with data.data
        classesArray = responseData.data;
      } else if (responseData && Array.isArray(responseData.items)) {
        // Paginated response with items
        classesArray = responseData.items;
      }
      
      console.log('Processed classes array:', classesArray);
      console.log('Number of classes:', classesArray.length);
      setClasses(classesArray);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      if (axios.isAxiosError(error)) {
        console.error('API error response:', error.response?.data);
        console.error('API error status:', error.response?.status);
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get(`${API_URL}/wards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wardData = response.data.data || [];
      setWards(wardData.map((w: any) => w.name));
    } catch (error) {
      console.error('Failed to fetch wards:', error);
      setWards([]);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const instructorName = cls.instructor?.user 
      ? `${cls.instructor.user.firstName} ${cls.instructor.user.lastName}` 
      : '';
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = wardFilter === 'all' || cls.ward?.name === wardFilter;
    return matchesSearch && matchesWard;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {isMyClassesPage ? 'My Classes' : 'Classes'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isMyClassesPage 
              ? 'Manage your teaching classes and enrolled students' 
              : user?.role?.toUpperCase() === 'ADMIN' 
                ? 'Manage all skill training classes' 
                : 'Browse and enroll in skill training classes'}
          </p>
        </div>
        {user?.role?.toUpperCase() === 'ADMIN' && !isMyClassesPage && (
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
        )}
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
            {wards.map(ward => (
              <SelectItem key={ward} value={ward}>{ward}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classes Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isMyClassesPage ? (
        /* Table View for Instructor's My Classes */
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-purple-50 to-blue-50">
            <CardTitle>Your Teaching Classes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes assigned yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 hover:from-primary/15 hover:via-purple-100 hover:to-blue-100">
                      <TableHead className="font-bold text-foreground">Class Name</TableHead>
                      <TableHead className="font-bold text-foreground">Schedule</TableHead>
                      <TableHead className="font-bold text-foreground">Ward</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Enrolled</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Capacity</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Status</TableHead>
                      <TableHead className="font-bold text-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls, index) => {
                      const enrolled = cls._count?.enrollments || 0;
                      const capacity = cls.maxCapacity || 0;
                      const scheduleTime = cls.schedule?.startTime && cls.schedule?.endTime 
                        ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` 
                        : 'Schedule TBA';
                      const scheduleDays = cls.schedule?.days?.join(', ') || 'Days TBA';
                      const enrollmentPercent = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

                      return (
                        <TableRow 
                          key={cls.id}
                          className={index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-blue-50/30 hover:bg-blue-50/50'}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{cls.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{cls.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{scheduleDays}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{scheduleTime}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {cls.ward?.name || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {enrolled}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              {capacity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge 
                                className={`
                                  ${enrollmentPercent >= 90 ? 'bg-red-100 text-red-700 border-red-200' : ''}
                                  ${enrollmentPercent >= 70 && enrollmentPercent < 90 ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                                  ${enrollmentPercent < 70 ? 'bg-green-100 text-green-700 border-green-200' : ''}
                                `}
                              >
                                {enrollmentPercent}%
                              </Badge>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full transition-all ${
                                    enrollmentPercent >= 90 ? 'bg-red-500' : 
                                    enrollmentPercent >= 70 ? 'bg-amber-500' : 
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${enrollmentPercent}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => navigate(`/canvas/${cls.id}`)}
                                className="h-8 bg-gradient-to-r from-primary to-blue-600"
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Grid View for Everyone Else */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredClasses.map((cls, index) => {
            const enrolled = cls._count?.enrollments || 0;
            const capacity = cls.maxCapacity || 0;
            const instructorName = cls.instructor?.user 
              ? `${cls.instructor.user.firstName} ${cls.instructor.user.lastName}`
              : 'Instructor TBA';
            const scheduleTime = cls.schedule?.startTime && cls.schedule?.endTime 
              ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` 
              : 'Schedule TBA';
            const scheduleDays = cls.schedule?.days?.join(', ') || 'Days TBA';
            const wardName = cls.ward?.name || 'Ward TBA';

            return (
              <Card 
                key={cls.id} 
                className="shadow-lg hover:shadow-2xl transition-all duration-500 animate-slide-up overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-green-500/5 to-transparent border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold mb-1 text-slate-900 dark:text-white">{cls.name}</CardTitle>
                    </div>
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/class/${cls.id}`); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {cls.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <Avatar className="h-10 w-10 ring-2 ring-green-500/20">
                      <AvatarImage src={cls.instructor?.user?.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold">
                        {cls.instructor?.user ? 
                          `${cls.instructor.user.firstName[0]}${cls.instructor.user.lastName[0]}` 
                          : 'IN'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{instructorName}</p>
                      <p className="text-xs text-muted-foreground">Lead Instructor</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">{scheduleDays}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">{scheduleTime}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">{enrolled} / {capacity} enrolled</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Enrollment Progress</span>
                      <span className="text-xs font-bold text-green-600">
                        {capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${capacity > 0 ? (enrolled / capacity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/enrollment/${cls.id}`); }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-11"
                    disabled={capacity > 0 && enrolled >= capacity}
                  >
                    {(capacity > 0 && enrolled >= capacity) ? (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Class Full
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Enroll Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredClasses.length === 0 && !isMyClassesPage && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No classes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
