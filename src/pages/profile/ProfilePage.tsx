import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
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

const wards = ['Central Ward', 'North Ward', 'South Ward', 'East Ward', 'West Ward'];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ward: 'Central Ward',
  });

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      ward: 'Central Ward',
    });
    setIsEditing(false);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'student': return 'Student';
      default: return '';
    }
  };

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
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="church" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
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
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
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
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Cards */}
      {user?.role === 'student' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Enrollment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Tailoring & Fashion Design</p>
                  <p className="text-sm text-muted-foreground">Enrolled: Oct 2024</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Music & Choir Training</p>
                  <p className="text-sm text-muted-foreground">Enrolled: Sep 2024</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.role === 'instructor' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Skills & Teaching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground mb-2 block">Skills Taught</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Tailoring</Badge>
                  <Badge variant="secondary">Fashion Design</Badge>
                  <Badge variant="secondary">Sewing</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">35</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
