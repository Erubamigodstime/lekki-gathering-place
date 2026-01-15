import { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  Save,
  FileText,
  Users,
  AlertCircle,
  Upload,
  File,
  FileVideo,
  Link as LinkIcon,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Lesson {
  id: string;
  title: string;
  content: string;
  weekNumber: number;
  orderIndex: number;
  isPublished: boolean;
  description?: string;
  courseMaterials?: CourseMaterial[];
}

interface WeekModule {
  week: number;
  title: string;
  lessons: Lesson[];
  publishedCount: number;
  totalLessons: number;
}

interface PendingApproval {
  id: string;
  weekNumber: number;
  student: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  completed: boolean;
  completedAt: string;
  submissionNotes?: string;
}

interface CourseMaterial {
  id: string;
  lessonId: string;
  title: string;
  fileUrl: string;
  type: 'PDF' | 'DOCUMENT' | 'VIDEO' | 'LINK';
  fileSize?: number;
  orderIndex: number;
}

interface InstructorModulesPageProps {
  classId: string;
  onPendingChange?: (count: number) => void;
}

export default function InstructorModulesPage({ classId, onPendingChange }: InstructorModulesPageProps) {
  const [modules, setModules] = useState<WeekModule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'approvals'>('content');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weekNumber: 1,
    orderIndex: 0,
    isPublished: false,
  });

  // File upload state
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Action loading states
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);
  const [publishingLesson, setPublishingLesson] = useState<string | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<string | null>(null);

  const [classData, setClassData] = useState<any>(null);

  useEffect(() => {
    fetchClassData();
    fetchModules();
    fetchPendingApprovals();
  }, [classId]);

  useEffect(() => {
    if (onPendingChange) {
      onPendingChange(pendingApprovals.length);
    }
  }, [pendingApprovals, onPendingChange]);

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch class data first if not available
      let currentClassData = classData;
      if (!currentClassData) {
        const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        currentClassData = classResponse.data.data;
        setClassData(currentClassData);
      }
      
      // Fetch lessons for this class
      const lessonsResponse = await axios.get(`${API_URL}/lessons/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { data: [] } }));

      const lessonsData = lessonsResponse.data.data || [];
      const totalWeeks = currentClassData?.totalWeeks || 10;
      const weeklySchedule = currentClassData?.schedule?.weeklyLessons || [];

      console.log('=== Fetching Modules ===');
      console.log('Class Data:', currentClassData);
      console.log('Schedule:', currentClassData?.schedule);
      console.log('Weekly Lessons in Schedule:', weeklySchedule);
      console.log('Fetched lessons:', lessonsData);
      console.log('Total weeks:', totalWeeks);

      // Group lessons by week
      const modulesMap = new Map<number, WeekModule>();
      
      for (let week = 1; week <= totalWeeks; week++) {
        const weekLessons = lessonsData.filter((l: any) => l.weekNumber === week);
        const publishedCount = weekLessons.filter((l: any) => l.isPublished).length;
        const scheduleData = weeklySchedule.find((s: any) => s.week === week);
        
        modulesMap.set(week, {
          week,
          title: scheduleData?.title || `Week ${week}`,
          lessons: weekLessons,
          publishedCount,
          totalLessons: weekLessons.length,
        });
      }

      setModules(Array.from(modulesMap.values()));
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/week-progress?classId=${classId}&completed=true&instructorApproved=false`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingApprovals(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    }
  };

  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  const handleCreateLesson = () => {
    setEditingLesson(null);
    setCourseMaterials([]); // Clear materials for new lesson
    setFormData({
      title: '',
      description: '',
      weekNumber: 1,
      orderIndex: 0,
      isPublished: false,
    });
    setShowCreateDialog(true);
  };

  const handleCreateFromSchedule = (week: number) => {
    const scheduleData = classData?.schedule?.weeklyLessons?.find((s: any) => s.week === week);
    if (!scheduleData) {
      handleCreateLesson();
      return;
    }

    // Build description from schedule data
    let description = scheduleData.title || `Week ${week} Lesson`;
    
    if (scheduleData.objectives && scheduleData.objectives.length > 0) {
      description += '\n\nLearning Objectives:\n';
      scheduleData.objectives.forEach((obj: string) => {
        description += `- ${obj}\n`;
      });
    }
    
    if (scheduleData.activities && scheduleData.activities.length > 0) {
      description += '\nActivities:\n';
      scheduleData.activities.forEach((act: string) => {
        description += `- ${act}\n`;
      });
    }

    if (scheduleData.topics && scheduleData.topics.length > 0) {
      description += '\nTopics:\n';
      scheduleData.topics.forEach((topic: string) => {
        description += `- ${topic}\n`;
      });
    }

    setEditingLesson(null);
    setFormData({
      title: scheduleData.title || `Week ${week} Lesson`,
      description: description,
      weekNumber: week,
      orderIndex: 0,
      isPublished: true, // ✅ Publish by default when creating from schedule
    });
    setShowCreateDialog(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      weekNumber: lesson.weekNumber,
      orderIndex: lesson.orderIndex,
      isPublished: lesson.isPublished,
    });
    fetchCourseMaterials(lesson.id); // Load materials for editing
    setShowCreateDialog(true);
  };

  const handleSaveLesson = async () => {
    setSavingLesson(true);
    try {
      const token = localStorage.getItem('token');
      
      if (editingLesson) {
        // Update existing lesson
        await axios.put(
          `${API_URL}/lessons/${editingLesson.id}`,
          { ...formData, classId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Lesson updated successfully!');
      } else {
        // Create new lesson
        await axios.post(
          `${API_URL}/lessons`,
          { ...formData, classId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Lesson created successfully!');
      }
      
      setShowCreateDialog(false);
      fetchModules();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      toast.error('Failed to save lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    setDeletingLesson(lessonId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Lesson deleted successfully!');
      fetchModules();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      toast.error('Failed to delete lesson');
    } finally {
      setDeletingLesson(null);
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    setPublishingLesson(lesson.id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/lessons/${lesson.id}`,
        { isPublished: !lesson.isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(lesson.isPublished ? 'Lesson unpublished' : 'Lesson published!');
      fetchModules();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update lesson');
    } finally {
      setPublishingLesson(null);
    }
  };

  // File upload functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, Word, and PowerPoint files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem('token');
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = uploadResponse.data.url;

      // Determine material type
      let materialType: 'PDF' | 'DOCUMENT' = 'DOCUMENT';
      if (file.type === 'application/pdf') {
        materialType = 'PDF';
      }

      // Create course material
      await axios.post(
        `${API_URL}/course-materials`,
        {
          lessonId,
          title: file.name,
          fileUrl,
          type: materialType,
          fileSize: file.size,
          orderIndex: courseMaterials.length,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('File uploaded successfully!');
      await fetchCourseMaterials(lessonId);
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const fetchCourseMaterials = async (lessonId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/course-materials/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseMaterials(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch course materials:', error);
    }
  };

  const handleDeleteMaterial = async (materialId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingMaterial(materialId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/course-materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('File deleted successfully!');
      await fetchCourseMaterials(lessonId);
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeletingMaterial(null);
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <File className="h-4 w-4 text-red-600" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'VIDEO':
        return <FileVideo className="h-4 w-4 text-purple-600" />;
      case 'LINK':
        return <LinkIcon className="h-4 w-4 text-green-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleApproveWeek = async (progressId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/week-progress/${progressId}/approve`,
        { instructorApproved: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Week progress approved!');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve progress');
    }
  };

  const handleRejectWeek = async (progressId: string) => {
    if (!confirm('Are you sure you want to reject this week completion? The student will need to resubmit.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      // Use the approve endpoint but set instructorApproved to false
      await axios.post(
        `${API_URL}/week-progress/${progressId}/approve`,
        { instructorApproved: false, completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Week progress rejected');
      fetchPendingApprovals();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject progress');
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Modules & Content</h1>
            <p className="text-gray-600 mt-1">Create and manage weekly lessons and content</p>
          </div>
          <Button onClick={handleCreateLesson} className="bg-gradient-to-r from-church-gold to-yellow-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How Module Management Works</p>
            <p className="text-blue-700">
              Students see the class schedule by default. When you create and <strong>publish</strong> a lesson for a week, 
              it replaces the schedule view for students with your custom content. Unpublished lessons are only visible to you.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {modules.reduce((sum, m) => sum + m.totalLessons, 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">
                    {modules.reduce((sum, m) => sum + m.publishedCount, 0)}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {pendingApprovals.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="approvals">
            Pending Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">{modules.map((module) => (
            <Card key={module.week} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-colors"
                onClick={() => toggleWeek(module.week)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedWeeks.has(module.week) ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">Week {module.week}: {module.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.totalLessons} {module.totalLessons === 1 ? 'lesson' : 'lessons'}
                        {' • '}
                        {module.publishedCount} published
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={module.publishedCount > 0 ? 'default' : 'secondary'} className={
                      module.publishedCount > 0 ? 'bg-green-100 text-green-700' : ''
                    }>
                      {module.publishedCount > 0 ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {expandedWeeks.has(module.week) && (
                <CardContent className="p-6">
                  {/* Class Schedule Info - Always show if exists */}
                  {(() => {
                    const scheduleData = classData?.schedule?.weeklyLessons?.find((s: any) => s.week === module.week);
                    
                    // Show schedule info box
                    return (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900">Week {module.week} Schedule</h4>
                          </div>
                          {classData?.schedule?.days && classData?.schedule?.time && (
                            <Badge variant="outline" className="bg-white">
                              {classData.schedule.days.join(', ')} at {classData.schedule.time}
                            </Badge>
                          )}
                        </div>
                        
                        {scheduleData ? (
                          <>
                            {scheduleData.title && (
                              <div className="mb-3">
                                <p className="text-sm font-semibold text-blue-900">{scheduleData.title}</p>
                              </div>
                            )}
                            {scheduleData.objectives && scheduleData.objectives.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-blue-800 uppercase mb-2">Learning Objectives:</p>
                                <ul className="space-y-1">
                                  {scheduleData.objectives.map((obj: string, idx: number) => (
                                    <li key={idx} className="text-sm text-blue-900 flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{obj}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {scheduleData.activities && scheduleData.activities.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-blue-800 uppercase mb-2">Activities:</p>
                                <ul className="space-y-1">
                                  {scheduleData.activities.map((activity: string, idx: number) => (
                                    <li key={idx} className="text-sm text-blue-900 flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="text-xs text-blue-700 mt-3 italic">
                              {module.lessons.length === 0 
                                ? 'Students currently see this schedule. Create and publish a lesson to replace it with custom content.'
                                : 'This is the original schedule. Your published lesson content is shown to students.'}
                            </p>
                          </>
                        ) : (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">No predefined schedule for this week.</p>
                            <p className="text-xs text-blue-700">Create a lesson below to add content for students to see.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {module.lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm mb-1">No lesson content has been created for this week</p>
                      <p className="text-xs text-gray-400 mb-4">
                        {classData?.schedule?.weeklyLessons?.find((s: any) => s.week === module.week) 
                          ? '💡 Tip: Use the schedule template to quickly create a published lesson'
                          : 'Create your first lesson for this week'}
                      </p>
                      <div className="flex gap-2 justify-center">
                        {classData?.schedule?.weeklyLessons?.find((s: any) => s.week === module.week) && (
                          <Button 
                            variant="default" 
                            className="bg-gradient-to-r from-primary to-blue-600 transition-all duration-150 active:scale-95 hover:shadow-lg active:shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateFromSchedule(module.week);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Create & Publish from Schedule
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="transition-all duration-150 active:scale-95 hover:shadow-lg active:shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, weekNumber: module.week });
                            handleCreateLesson();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create from Scratch
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {module.lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                              {lesson.isPublished ? (
                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {lesson.description?.substring(0, 100) || 'No description'}...
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublish(lesson)}
                              disabled={publishingLesson === lesson.id}
                              className="transition-all duration-150 active:scale-95"
                            >
                              {publishingLesson === lesson.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                lesson.isPublished ? 'Unpublish' : 'Publish'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                              className="transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              disabled={deletingLesson === lesson.id}
                              className="text-red-600 hover:text-red-700 hover:border-red-300 transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-sm"
                            >
                              {deletingLesson === lesson.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending module approvals at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Header */}
              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending Weekly Completions</h3>
                      <p className="text-sm text-gray-600">
                        {pendingApprovals.length} student{pendingApprovals.length !== 1 ? 's' : ''} waiting for your review
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{pendingApprovals.length}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">To Review</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approvals List */}
              {pendingApprovals.map((approval) => (
                <Card key={approval.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Student Info Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                              <span className="text-white font-semibold text-lg">
                                {approval.student.user.firstName[0]}{approval.student.user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {approval.student.user.firstName} {approval.student.user.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">{approval.student.user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            Week {approval.weekNumber}
                          </Badge>
                        </div>
                        
                        {/* Completion Details */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                                <span className="font-semibold text-gray-900 text-base">Week {approval.weekNumber} Completion Request</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-700">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>Submitted: {new Date(approval.completedAt).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Student Notes */}
                          {approval.submissionNotes && (
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Student Notes:</p>
                              <div className="bg-white p-3 rounded border border-purple-100">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{approval.submissionNotes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-4">
                        <Button
                          onClick={() => handleApproveWeek(approval.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectWeek(approval.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update the lesson content' : 'Add a new lesson to your course'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Week</label>
                <Select 
                  value={formData.weekNumber.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, weekNumber: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: classData?.totalWeeks || 10 }, (_, i) => i + 1).map((w) => (
                      <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Order</label>
                <Input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Lesson Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter lesson description..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {/* File Upload Section - Only show when editing existing lesson */}
            {editingLesson && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Course Materials</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingFile}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-sm"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => handleFileUpload(e, editingLesson.id)}
                  />
                </div>

                {/* Materials List */}
                {courseMaterials.length > 0 ? (
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {courseMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          {getMaterialIcon(material.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{material.title}</p>
                            <p className="text-xs text-gray-500">
                              {material.type} {material.fileSize && `• ${formatFileSize(material.fileSize)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View
                          </a>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMaterial(material.id, editingLesson.id)}
                            disabled={deletingMaterial === material.id}
                            className="transition-all duration-150 active:scale-95"
                          >
                            {deletingMaterial === material.id ? (
                              <Loader2 className="h-4 w-4 text-red-600 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                    No files uploaded yet. Click "Upload File" to add PDF, Word, or PowerPoint files.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Publish immediately (make visible to students)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={savingLesson} className="transition-all duration-150 active:scale-95 hover:shadow-md active:shadow-sm">
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={savingLesson} className="bg-gradient-to-r from-church-gold to-yellow-600 transition-all duration-150 active:scale-95 hover:shadow-lg active:shadow-sm">
              {savingLesson ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingLesson ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
