import { useState, useEffect } from 'react';
import { Plus, Send, Megaphone, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  views: number;
}

interface InstructorAnnouncementsPageProps {
  classId: string;
}

export default function InstructorAnnouncementsPage({ classId }: InstructorAnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    targetClassId: classId, // Allow selecting different class
  });

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, [classId]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/instructors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const instructorClasses = response.data.data?.classes || [];
      setClasses(instructorClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/announcements/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({ 
      title: '', 
      content: '', 
      priority: 'normal',
      targetClassId: classId // Default to current class
    });
    setShowCreateDialog(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Convert priority to uppercase to match database enum
      const payload = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority.toUpperCase(),
        classId: formData.targetClassId, // Use selected class
      };

      console.log('Creating announcement with payload:', payload);
      console.log('Announcement will be sent to classId:', payload.classId);
      
      if (editingAnnouncement) {
        // When editing, don't change the class
        const editPayload = {
          title: formData.title,
          content: formData.content,
          priority: formData.priority.toUpperCase(),
        };
        await axios.put(
          `${API_URL}/announcements/${editingAnnouncement.id}`,
          editPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Announcement updated!');
      } else {
        const response = await axios.post(
          `${API_URL}/announcements`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Announcement created:', response.data);
        const selectedClass = classes.find(c => c.id === formData.targetClassId);
        toast.success(`Announcement posted to all students in ${selectedClass?.name || 'the class'}!`);
      }
      
      setShowCreateDialog(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        const message = error.response?.data?.message || 'Failed to create announcement';
        toast.error(message);
      } else {
        toast.error('Failed to save announcement');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Announcement deleted!');
      fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Communicate important updates to your students</p>
        </div>
        <Button 
          onClick={handleCreate} 
          className="bg-gradient-to-r from-church-gold to-yellow-600 transition-all duration-150 active:scale-95 hover:shadow-lg active:shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
              <p className="text-gray-600 mb-4">Start communicating with your students</p>
              <Button 
                onClick={handleCreate} 
                variant="outline"
                className="transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Megaphone className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {announcement.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setFormData({
                          title: announcement.title,
                          content: announcement.content,
                          priority: announcement.priority,
                        });
                        setShowCreateDialog(true);
                      }}
                      className="transition-all duration-150 active:scale-90 hover:bg-slate-50 active:bg-slate-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700 transition-all duration-150 active:scale-90 hover:bg-red-50 active:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {announcement.content}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
            <DialogDescription>
              Share important updates with your students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1 px-1">
            {/* Class Selector - Only show when creating new announcement and instructor has multiple classes */}
            {!editingAnnouncement && classes.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.targetClassId}
                  onChange={(e) => setFormData({ ...formData, targetClassId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-church-gold focus:border-transparent"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls._count?.enrollments || 0} students)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This announcement will be visible to all approved students in the selected class
                </p>
              </div>
            )}
            
            {!editingAnnouncement && classes.length === 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Sending to:</strong> {classes[0]?.name} ({classes[0]?._count?.enrollments || 0} students)
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your announcement..."
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="transition-all duration-150 active:scale-95 hover:bg-slate-50 active:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-church-gold to-yellow-600 transition-all duration-150 active:scale-95 hover:shadow-lg active:shadow-sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {editingAnnouncement ? 'Update' : 'Post'} Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
