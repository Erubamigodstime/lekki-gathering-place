import { useState, useEffect } from 'react';
import { Megaphone, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  instructor: {
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  priority?: 'normal' | 'important' | 'urgent';
}

interface AnnouncementsPageProps {
  classId: string;
}

export default function AnnouncementsPage({ classId }: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedAnnouncements, setViewedAnnouncements] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAnnouncements();
    // Load previously viewed announcements from localStorage
    const viewed = localStorage.getItem('viewedAnnouncements');
    if (viewed) {
      setViewedAnnouncements(new Set(JSON.parse(viewed)));
    }
  }, [classId]);

  useEffect(() => {
    // Increment view count for newly loaded announcements
    if (announcements.length > 0) {
      announcements.forEach((announcement) => {
        if (!viewedAnnouncements.has(announcement.id)) {
          incrementViewCount(announcement.id);
        }
      });
    }
  }, [announcements]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== Student Fetching Announcements ===');
      console.log('ClassId:', classId);
      console.log('API URL:', `${API_URL}/announcements/class/${classId}`);
      
      const response = await axios.get(
        `${API_URL}/announcements/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const fetchedAnnouncements = response.data.data || [];
      console.log('Announcements received:', fetchedAnnouncements.length);
      console.log('Student will see all announcements posted by instructor for this class');
      
      setAnnouncements(fetchedAnnouncements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (announcementId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/announcements/${announcementId}/view`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mark as viewed in localStorage
      const newViewed = new Set(viewedAnnouncements);
      newViewed.add(announcementId);
      setViewedAnnouncements(newViewed);
      localStorage.setItem('viewedAnnouncements', JSON.stringify([...newViewed]));
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">
            Stay updated with important information from your instructor
          </p>
        </div>

        {announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No announcements yet
              </h3>
              <p className="text-gray-600">
                Your instructor hasn't posted any announcements for this class
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`border-l-4 ${
                  announcement.priority === 'urgent'
                    ? 'border-l-red-500'
                    : announcement.priority === 'important'
                    ? 'border-l-orange-500'
                    : 'border-l-blue-500'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.priority && announcement.priority !== 'normal' && (
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {announcement.instructor.user.firstName}{' '}
                      {announcement.instructor.user.lastName}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
