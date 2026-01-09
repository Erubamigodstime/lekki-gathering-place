import { useState, useEffect } from 'react';
import { Users, Mail, Search, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

      // Fetch class details with instructor
      const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch all approved enrollments for this class
      const enrollmentsResponse = await axios.get(
        `${API_URL}/enrollments?classId=${classId}&status=APPROVED`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ data: { data: [] } }));

      const membersList: ClassMember[] = [];
      const classData = classResponse.data.data || classResponse.data;

      // Add instructor first
      if (classData?.instructor) {
        const instructor = classData.instructor;
        membersList.push({
          id: instructor.userId || instructor.id,
          firstName: instructor.user?.firstName || instructor.firstName || 'Instructor',
          lastName: instructor.user?.lastName || instructor.lastName || '',
          email: instructor.user?.email || instructor.email || '',
          role: 'INSTRUCTOR',
          profilePicture: instructor.user?.profilePicture || instructor.profilePicture,
        });
      }

      // Add all approved students
      const enrollments = enrollmentsResponse.data.data || [];
      enrollments.forEach((enrollment: any) => {
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {instructor ? 1 : 0}
                  </div>
                  <div className="text-sm text-gray-600">Instructor</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructor Section */}
        {instructor && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Instructor
            </h2>
            <Card className="border-2 border-church-gold/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-church-gold text-white text-xl">
                        {instructor.firstName[0]}
                        {instructor.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <p className="text-gray-600">{instructor.email}</p>
                      <Badge className="mt-2 bg-church-gold">Instructor</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => onMessageUser?.(instructor.id, `${instructor.firstName} ${instructor.lastName}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({students.length})
          </h2>

          {students.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No students found' : 'No students enrolled yet'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Students who enroll in this class will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id} className="hover:border-church-gold transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onMessageUser?.(student.id, `${student.firstName} ${student.lastName}`)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
