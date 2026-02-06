import { useState, useEffect } from 'react';
import { Users, Mail, Search, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ClassMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  profilePicture?: string;
  enrollmentStatus?: string;
}

interface PeoplePageProps {
  classId: string;
  onMessageUser?: (userId: string, userName: string) => void;
}

export default function PeoplePage({ classId, onMessageUser }: PeoplePageProps) {
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ClassMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      const token = localStorage.getItem('token');

      // Fetch class details with instructor and enrollments
      const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Class response:', classResponse.data);

      const membersList: ClassMember[] = [];
      const classData = classResponse.data.data || classResponse.data;

      // Add instructor first
      if (classData?.instructor) {
        const instructor = classData.instructor;
        console.log('Instructor data:', instructor);
        membersList.push({
          id: instructor.userId || instructor.id,
          firstName: instructor.user?.firstName || instructor.firstName || 'Instructor',
          lastName: instructor.user?.lastName || instructor.lastName || '',
          email: instructor.user?.email || instructor.email || '',
          role: 'INSTRUCTOR',
          profilePicture: instructor.user?.profilePicture || instructor.profilePicture,
        });
      }

      // Add all approved students from class enrollments
      if (classData?.enrollments && Array.isArray(classData.enrollments)) {
        console.log('Processing enrollments from class data:', classData.enrollments);
        classData.enrollments.forEach((enrollment: any) => {
          console.log('Enrollment item:', enrollment);
          if (enrollment.status === 'APPROVED' && enrollment.student?.user) {
            membersList.push({
              id: enrollment.student.userId,
              firstName: enrollment.student.user.firstName,
              lastName: enrollment.student.user.lastName,
              email: enrollment.student.user.email,
              role: 'STUDENT',
              profilePicture: enrollment.student.user.profilePicture,
              enrollmentStatus: enrollment.status,
            });
          }
        });
      } else {
        console.log('No enrollments found in class data');
      }

      console.log('Final members list:', membersList);
      setMembers(membersList);
      setFilteredMembers(membersList);
    } catch (error) {
      console.error('Failed to fetch class members:', error);
    } finally {
      setLoading(false);
    }
  };

  const instructor = filteredMembers.find((m) => m.role === 'INSTRUCTOR');
  const students = filteredMembers.filter((m) => m.role === 'STUDENT');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People</h1>
          <p className="text-gray-600">
            Instructor and students enrolled in this class
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Professional Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{members.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Instructors</p>
                  <p className="text-3xl font-bold text-gray-900">{instructor ? 1 : 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Students</p>
                  <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Members Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold text-center">Role</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Users className="h-12 w-12 mb-3 text-gray-300" />
                          <p className="font-medium">
                            {searchQuery ? 'No members found' : 'No members yet'}
                          </p>
                          <p className="text-sm mt-1">
                            {searchQuery
                              ? 'Try adjusting your search'
                              : 'Class members will appear here'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow 
                        key={member.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onMessageUser?.(member.id, `${member.firstName} ${member.lastName}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {member.profilePicture && (
                                <AvatarImage src={member.profilePicture} alt={`${member.firstName} ${member.lastName}`} />
                              )}
                              <AvatarFallback className={`${
                                member.role === 'INSTRUCTOR' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {member.firstName[0]}{member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-700">{member.email}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`${
                              member.role === 'INSTRUCTOR'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                            variant="secondary"
                          >
                            {member.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessageUser?.(member.id, `${member.firstName} ${member.lastName}`);
                            }}
                            className="hover:bg-blue-50"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
