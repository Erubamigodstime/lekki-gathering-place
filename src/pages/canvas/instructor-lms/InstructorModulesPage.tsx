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
  Link as LinkIcon
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
  week: number;
  order: number;
  published: boolean;
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
    content: '',
    week: 1,
    order: 1,
    published: false,
  });

  // File upload state
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

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

      // Group lessons by week
      const modulesMap = new Map<number, WeekModule>();
      
      for (let week = 1; week <= totalWeeks; week++) {
        const weekLessons = lessonsData.filter((l: any) => l.week === week);
        const publishedCount = weekLessons.filter((l: any) => l.published).length;
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
      content: '',
      week: 1,
      order: 1,
      published: false,
    });
    setShowCreateDialog(true);
  };

  const handleCreateFromSchedule = (week: number) => {
    const scheduleData = classData?.schedule?.weeklyLessons?.find((s: any) => s.week === week);
    if (!scheduleData) {
      handleCreateLesson();
      return;
    }

    // Pre-populate from schedule
    const content = `
      <div class="space-y-6">
        ${scheduleData.objectives ? `
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">Learning Objectives</h3>
            <ul class="space-y-2">
              ${scheduleData.objectives.map((obj: string) => `
                <li class="flex items-start">
                  <span class="text-blue-500 mr-2">✓</span>
                  <span>${obj}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        ${scheduleData.activities ? `
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h3 class="text-lg font-semibold text-green-900 mb-3">Activities</h3>
            <ul class="space-y-2">
              ${scheduleData.activities.map((act: string) => `
                <li class="flex items-start">
                  <span class="text-green-500 mr-2">→</span>
                  <span>${act}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h3 class="text-lg font-semibold text-yellow-900 mb-2">Instructor Notes</h3>
          <p class="text-gray-700">Add additional details, resources, or instructions here...</p>
        </div>
      </div>
    `.trim();

    setEditingLesson(null);
    setFormData({
      title: scheduleData.title || `Week ${week} Lesson`,
      content: content,
      week: week,
      order: 1,
      published: false,
    });
    setShowCreateDialog(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      week: lesson.week,
      order: lesson.order,
      published: lesson.published,
    });
    fetchCourseMaterials(lesson.id); // Load materials for editing
    setShowCreateDialog(true);
  };

  const handleSaveLesson = async () => {
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
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
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
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/lessons/${lesson.id}`,
        { published: !lesson.published },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(lesson.published ? 'Lesson unpublished' : 'Lesson published!');
      fetchModules();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update lesson');
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
                  {module.lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm mb-1">No lessons created for this week yet</p>
                      <p className="text-xs text-gray-400 mb-4">
                        {classData?.schedule?.weeklyLessons?.find((s: any) => s.week === module.week) 
                          ? 'You can create from scratch or use the class schedule template'
                          : 'Create your first lesson for this week'}
                      </p>
                      <div className="flex gap-2 justify-center">
                        {classData?.schedule?.weeklyLessons?.find((s: any) => s.week === module.week) && (
                          <Button 
                            variant="default" 
                            className="bg-gradient-to-r from-primary to-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateFromSchedule(module.week);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Use Schedule Template
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, week: module.week });
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
                              {lesson.published ? (
                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                              ) : (
                                <Badge variant="secondary">Draft</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {lesson.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublish(lesson)}
                            >
                              {lesson.published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
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
            pendingApprovals.map((approval) => (
              <Card key={approval.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {approval.student.user.firstName} {approval.student.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{approval.student.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">Week {approval.weekNumber} Completion Request</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          Completed on: {new Date(approval.completedAt).toLocaleString()}
                        </p>
                        {approval.submissionNotes && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Student Notes:</p>
                            <p className="text-sm text-blue-800">{approval.submissionNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleApproveWeek(approval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectWeek(approval.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
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
                  value={formData.week.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, week: parseInt(v) })}
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
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min={1}
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
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter lesson content (HTML supported)..."
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
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingFile ? 'Uploading...' : 'Upload File'}
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
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Publish immediately (make visible to students)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} className="bg-gradient-to-r from-church-gold to-yellow-600">
              <Save className="h-4 w-4 mr-2" />
              {editingLesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
