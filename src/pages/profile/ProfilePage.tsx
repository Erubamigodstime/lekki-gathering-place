import { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const wards = ['Central Ward', 'North Ward', 'South Ward', 'East Ward', 'West Ward'];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [instructorStats, setInstructorStats] = useState<any>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ward: 'Central Ward',
  });

  // Fetch profile data from database on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.data;
        setProfileData(userData);
        
        // Populate form data with database values
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          ward: userData.ward?.name || 'Central Ward',
        });

        // Fetch additional data based on role
        if (userData.role?.toLowerCase() === 'instructor') {
          await fetchInstructorStats(token);
        } else if (userData.role?.toLowerCase() === 'student') {
          await fetchStudentEnrollments(token);
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const fetchInstructorStats = async (token: string) => {
    try {
      // Fetch instructor's classes
      const classesResponse = await axios.get(`${API_URL}/classes/my-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const classes = classesResponse.data.data || [];
      
      // Fetch enrollments for all classes to count students
      let totalStudents = 0;
      const skillsSet = new Set<string>();

      for (const classItem of classes) {
        // Add skills from class names/categories
        if (classItem.name) {
          // Extract potential skills from class name
          const name = classItem.name.toLowerCase();
          if (name.includes('tailoring')) skillsSet.add('Tailoring');
          if (name.includes('fashion')) skillsSet.add('Fashion Design');
          if (name.includes('sewing')) skillsSet.add('Sewing');
          if (name.includes('music')) skillsSet.add('Music');
          if (name.includes('choir')) skillsSet.add('Choir Training');
          if (name.includes('catering')) skillsSet.add('Catering');
          if (name.includes('makeup')) skillsSet.add('Makeup Artistry');
        }

        // Count approved students in this class
        try {
          const enrollmentsResponse = await axios.get(
            `${API_URL}/enrollments/class/${classItem.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const approvedEnrollments = (enrollmentsResponse.data.data || []).filter(
            (e: any) => e.status === 'APPROVED'
          );
          totalStudents += approvedEnrollments.length;
        } catch (error) {
          console.error('Failed to fetch enrollments for class:', classItem.id);
        }
      }

      setInstructorStats({
        totalClasses: classes.length,
        totalStudents,
        skills: Array.from(skillsSet),
      });
    } catch (error) {
      console.error('Failed to fetch instructor stats:', error);
    }
  };

  const fetchStudentEnrollments = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/enrollments/my-enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const enrollments = response.data.data || [];
      setStudentEnrollments(enrollments);
    } catch (error) {
      console.error('Failed to fetch student enrollments:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/users/profile`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsEditing(false);
      
      // Refresh profile data
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(response.data.data);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingPicture(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('picture', file);

      const response = await axios.post(
        `${API_URL}/users/profile/picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update local profile data
      setProfileData({ ...profileData, profilePicture: response.data.data.profilePicture });

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      ward: profileData?.ward?.name || 'Central Ward',
    });
    setIsEditing(false);
  };

  const getRoleLabel = () => {
    switch (profileData?.role?.toLowerCase()) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'student': return 'Student';
      default: return '';
    }
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="church" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileData?.profilePicture} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                    {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="profile-picture-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  title="Change profile picture"
                >
                  {uploadingPicture ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {profileData?.firstName} {profileData?.lastName}
                </h2>
                <Badge variant="secondary" className="mt-2">
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{formData.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{formData.lastName}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="flex-1"
                    />
                  ) : (
                    <span className="text-foreground">{formData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1"
                    />
                  ) : (
                    <span className="text-foreground">{formData.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Select value={formData.ward} onValueChange={(value) => setFormData({ ...formData, ward: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map(ward => (
                          <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-foreground">{formData.ward}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Cards */}
      {profileData?.role?.toLowerCase() === 'student' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment History</CardTitle>
          </CardHeader>
          <CardContent>
            {studentEnrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {studentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{enrollment.class?.name || 'Class'}</p>
                      <p className="text-sm text-muted-foreground">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge className={
                      enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {enrollment.status === 'APPROVED' ? 'Active' : enrollment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {profileData?.role?.toLowerCase() === 'instructor' && instructorStats && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Skills & Teaching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instructorStats.skills.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Skills Taught</Label>
                  <div className="flex flex-wrap gap-2">
                    {instructorStats.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{instructorStats.totalClasses}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{instructorStats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
