import { useState, useEffect } from 'react';
import { Users, Mail, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ClassMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  avatar?: string;
  enrollmentStatus?: string;
}

interface PeopleListProps {
  classId: string;
  userRole?: 'STUDENT' | 'INSTRUCTOR';
  onMessageUser?: (userId: string) => void;
}

export function PeopleList({ classId, userRole = 'STUDENT', onMessageUser }: PeopleListProps) {
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ClassMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClassMembers();
  }, [classId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        members.filter(
          (member) =>
            member.firstName.toLowerCase().includes(query) ||
            member.lastName.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, members]);

  const fetchClassMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all enrollments for this class
      const response = await axios.get(`${API_URL}/enrollments/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Transform enrollment data to members
      const enrollments = response.data.data || [];
      const membersList: ClassMember[] = enrollments.map((enrollment: any) => ({
        id: enrollment.student?.id || enrollment.studentId,
        firstName: enrollment.student?.user?.firstName || 'Unknown',
        lastName: enrollment.student?.user?.lastName || '',
        email: enrollment.student?.user?.email || '',
        role: 'STUDENT',
        enrollmentStatus: enrollment.status,
      }));

      // Fetch instructor info
      const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (classResponse.data.data?.instructor) {
        const instructor = classResponse.data.data.instructor;
        membersList.unshift({
          id: instructor.id,
          firstName: instructor.user?.firstName || 'Instructor',
          lastName: instructor.user?.lastName || '',
          email: instructor.user?.email || '',
          role: 'INSTRUCTOR',
        });
      }

      setMembers(membersList);
      setFilteredMembers(membersList);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch class members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'INSTRUCTOR' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading class members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Class Members</h3>
          <Badge variant="outline">{filteredMembers.length} {filteredMembers.length === 1 ? 'Person' : 'People'}</Badge>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No members found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {member.firstName} {member.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getRoleBadgeColor(member.role)}>
                    {member.role}
                  </Badge>
                  {onMessageUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMessageUser(member.id)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
                {member.enrollmentStatus && member.role === 'STUDENT' && (
                  <Badge variant="outline" className="mt-2">
                    {member.enrollmentStatus}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
