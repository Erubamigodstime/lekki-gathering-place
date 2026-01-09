import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Check, X, Eye, Mail, Phone, GraduationCap, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Instructor {
  id: string;
  bio: string;
  qualifications: string;
  approvalStatus: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string;
    ward?: {
      id: string;
      name: string;
    };
  };
  _count: {
    classes: number;
  };
}

interface Ward {
  id: string;
  name: string;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInstructors();
    fetchWards();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lekki-gathering-place-backend-1.onrender.com/api/v1/instructors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched instructors:', response.data.data);
      setInstructors(response.data.data);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lekki-gathering-place-backend-1.onrender.com/api/v1/wards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched wards:', response.data.data);
      setWards(response.data.data);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const handleApproval = async (instructorId: string, approved: boolean) => {
    try {
      setActionLoading(instructorId);
      const token = localStorage.getItem('token');
      await axios.patch(`https://lekki-gathering-place-backend-1.onrender.com/api/v1/instructors/${instructorId}/approve`, 
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the list
      await fetchInstructors();
    } catch (error) {
      console.error('Error updating instructor status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getSkills = (instructor: Instructor): string[] => {
    if (instructor.qualifications) {
      const skills = instructor.qualifications.split(',').map(s => s.trim()).filter(Boolean);
      return skills.length > 0 ? skills : ['General Teaching'];
    }
    return ['General Teaching'];
  };

  const filteredInstructors = instructors.filter(instructor => {
    const fullName = `${instructor.user.firstName} ${instructor.user.lastName}`.toLowerCase();
    const skills = getSkills(instructor);
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         instructor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesWard = wardFilter === 'all' || instructor.user.ward?.name === wardFilter;
    
    // Match tab - approvalStatus from DB is UPPERCASE (APPROVED, PENDING)
    let matchesTab = true;
    if (activeTab === 'approved') {
      matchesTab = instructor.approvalStatus === 'APPROVED';
    } else if (activeTab === 'pending') {
      matchesTab = instructor.approvalStatus === 'PENDING';
    }
    // activeTab === 'all' matches everything
    
    return matchesSearch && matchesWard && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = instructors.filter(i => i.approvalStatus === 'PENDING').length;
  const approvedCount = instructors.filter(i => i.approvalStatus === 'APPROVED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading instructors...</p>
        </div>
      </div>
    );
  }

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
        <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 relative"
          >
            All Instructors
            <span className="ml-2 bg-blue-700 text-white text-xs rounded-full px-1.5 py-0.5">
              {instructors.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="approved"
            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 relative"
          >
            Approved
            {approvedCount > 0 && (
              <span className="ml-2 bg-green-700 text-white text-xs rounded-full px-1.5 py-0.5">
                {approvedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 relative"
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-700 text-white text-xs rounded-full px-1.5 py-0.5">
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
            {wards.map(ward => (
              <SelectItem key={ward.id} value={ward.name}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredInstructors.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-full mb-4">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-muted-foreground font-medium">No instructors found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInstructors.map((instructor) => {
            const skills = getSkills(instructor);
            const isApproved = instructor.approvalStatus === 'APPROVED';
            const isPending = instructor.approvalStatus === 'PENDING';
            
            return (
              <Card key={instructor.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-primary/10">
                        {instructor.user.profilePicture ? (
                          <AvatarImage src={instructor.user.profilePicture} alt={`${instructor.user.firstName} ${instructor.user.lastName}`} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-bold">
                          {instructor.user.firstName[0]}{instructor.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">
                          {instructor.user.firstName} {instructor.user.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{instructor.user.ward?.name || 'No Ward'}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(instructor.approvalStatus)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{instructor.user.email}</span>
                    </div>
                    {instructor.user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{instructor.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {isApproved && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                        <GraduationCap className="h-4 w-4" />
                        <span className="font-medium">{instructor._count.classes} classes</span>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-3 pt-3 border-t flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproval(instructor.id, true)}
                        disabled={actionLoading === instructor.id}
                      >
                        {actionLoading === instructor.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleApproval(instructor.id, false)}
                        disabled={actionLoading === instructor.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <div className="mt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block overflow-hidden border-t-4 border-t-primary shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/10 via-purple-50 to-blue-50 hover:from-primary/15 hover:via-purple-100 hover:to-blue-100 border-b-2 border-primary/20">
                  <TableHead className="w-[250px] font-semibold text-foreground">Instructor</TableHead>
                  <TableHead className="font-semibold text-foreground">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold text-foreground">Ward</TableHead>
                  <TableHead className="font-semibold text-foreground">Classes</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-full mb-4">
                          <GraduationCap className="h-16 w-16 text-blue-600" />
                        </div>
                        <p className="text-lg font-semibold text-foreground mb-2">No instructors found</p>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstructors.map((instructor, index) => {
                    const skills = getSkills(instructor);
                    const isApproved = instructor.approvalStatus === 'APPROVED';
                    const isPending = instructor.approvalStatus === 'PENDING';
                    const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30';
                    
                    return (
                      <TableRow key={instructor.id} className={`${rowColor} hover:bg-blue-50 transition-colors border-b border-border/50`}>
                        {/* Instructor */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/10">
                              {instructor.user.profilePicture ? (
                                <AvatarImage src={instructor.user.profilePicture} alt={`${instructor.user.firstName} ${instructor.user.lastName}`} />
                              ) : null}
                              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-semibold">
                                {instructor.user.firstName[0]}{instructor.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {instructor.user.firstName} {instructor.user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                ID: {instructor.user.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Contact */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="bg-blue-100 p-1 rounded">
                                <Mail className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="truncate text-xs max-w-[200px]">{instructor.user.email}</span>
                            </div>
                            {instructor.user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="bg-green-100 p-1 rounded">
                                  <Phone className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-xs">{instructor.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Ward */}
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 p-1.5 rounded">
                              <MapPin className="h-3.5 w-3.5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium">{instructor.user.ward?.name || 'No Ward'}</span>
                          </div>
                        </TableCell>
                        
                        {/* Classes */}
                        <TableCell>
                          {isApproved && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-md border border-green-200">
                              <GraduationCap className="h-4 w-4" />
                              <span className="font-semibold text-sm">{instructor._count.classes}</span>
                            </div>
                          )}
                          {!isApproved && <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        
                        {/* Status */}
                        <TableCell>
                          {getStatusBadge(instructor.approvalStatus)}
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="h-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-sm"
                                  onClick={() => handleApproval(instructor.id, true)}
                                  disabled={actionLoading === instructor.id}
                                >
                                  {actionLoading === instructor.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  <span className="ml-1 hidden lg:inline">Approve</span>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                  onClick={() => handleApproval(instructor.id, false)}
                                  disabled={actionLoading === instructor.id}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="ml-1 hidden lg:inline">Reject</span>
                                </Button>
                              </>
                            )}
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
                                {isPending && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => handleApproval(instructor.id, true)}
                                      disabled={actionLoading === instructor.id}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleApproval(instructor.id, false)}
                                      disabled={actionLoading === instructor.id}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
