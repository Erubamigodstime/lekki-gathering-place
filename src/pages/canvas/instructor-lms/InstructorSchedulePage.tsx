import { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Save, X, Upload, FileText, File, Link as LinkIcon, Trash2, Download } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface WeekSchedule {
  week: number;
  title: string;
  topics: string[];
  description?: string;
}

interface ClassSchedule {
  days: string[];
  time: string;
  weeklyLessons?: WeekSchedule[];
}

interface CourseMaterial {
  id: string;
  title: string;
  fileUrl: string;
  type: 'PDF' | 'DOCUMENT' | 'VIDEO' | 'LINK';
  fileSize?: number;
}

interface Lesson {
  id: string;
  weekNumber: number;
  title: string;
  description?: string;
  courseMaterials: CourseMaterial[];
}

interface InstructorSchedulePageProps {
  classId: string;
}

export default function InstructorSchedulePage({ classId }: InstructorSchedulePageProps) {
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [loading, setLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [uploading, setUploading] = useState(false);

  const [weekForm, setWeekForm] = useState({
    title: '',
    description: '',
    topics: [''],
  });

  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'PDF' as 'PDF' | 'DOCUMENT' | 'LINK',
    file: null as File | null,
    url: '',
  });

  useEffect(() => {
    fetchScheduleData();
  }, [classId]);

  const fetchScheduleData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch class details
      const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const classData = classResponse.data.data;
      setSchedule(classData.schedule || { days: [], time: '', weeklyLessons: [] });
      setTotalWeeks(classData.totalWeeks || 12);

      // Fetch lessons with materials
      const lessonsResponse = await axios.get(`${API_URL}/lessons/class/${classId}?includeUnpublished=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLessons(lessonsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWeek = (week: number) => {
    const existingLesson = lessons.find(l => l.weekNumber === week);
    const weekSchedule = schedule?.weeklyLessons?.find(w => w.week === week);

    setEditingWeek(week);
    setWeekForm({
      title: existingLesson?.title || weekSchedule?.title || `Week ${week}`,
      description: existingLesson?.description || weekSchedule?.description || '',
      topics: weekSchedule?.topics || [''],
    });
  };

  const handleSaveWeek = async () => {
    if (!editingWeek) return;

    try {
      const token = localStorage.getItem('token');
      const existingLesson = lessons.find(l => l.weekNumber === editingWeek);

      const lessonData = {
        classId,
        weekNumber: editingWeek,
        title: weekForm.title,
        description: weekForm.description,
        isPublished: true,
      };

      if (existingLesson) {
        // Update existing lesson
        await axios.put(
          `${API_URL}/lessons/${existingLesson.id}`,
          lessonData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Week updated successfully!');
      } else {
        // Create new lesson
        await axios.post(
          `${API_URL}/lessons`,
          lessonData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Week created successfully!');
      }

      // Update class schedule with topics
      const updatedSchedule = { ...schedule };
      if (!updatedSchedule.weeklyLessons) {
        updatedSchedule.weeklyLessons = [];
      }
      
      const weekIndex = updatedSchedule.weeklyLessons.findIndex(w => w.week === editingWeek);
      const weekData = {
        week: editingWeek,
        title: weekForm.title,
        topics: weekForm.topics.filter(t => t.trim()),
        description: weekForm.description,
      };

      if (weekIndex >= 0) {
        updatedSchedule.weeklyLessons[weekIndex] = weekData;
      } else {
        updatedSchedule.weeklyLessons.push(weekData);
      }

      await axios.put(
        `${API_URL}/classes/${classId}`,
        { schedule: updatedSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingWeek(null);
      fetchScheduleData();
    } catch (error) {
      console.error('Failed to save week:', error);
      toast.error('Failed to save week');
    }
  };

  const handleAddTopic = () => {
    setWeekForm(prev => ({
      ...prev,
      topics: [...prev.topics, ''],
    }));
  };

  const handleRemoveTopic = (index: number) => {
    setWeekForm(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const handleTopicChange = (index: number, value: string) => {
    setWeekForm(prev => ({
      ...prev,
      topics: prev.topics.map((t, i) => i === index ? value : t),
    }));
  };

  const handleUploadMaterial = async () => {
    if (!materialForm.title) {
      toast.error('Please enter a title');
      return;
    }

    if (materialForm.type === 'LINK' && !materialForm.url) {
      toast.error('Please enter a URL');
      return;
    }

    if (materialForm.type !== 'LINK' && !materialForm.file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      // Get or create lesson for this week
      let lesson = lessons.find(l => l.weekNumber === selectedWeek);
      if (!lesson) {
        const lessonResponse = await axios.post(
          `${API_URL}/lessons`,
          {
            classId,
            weekNumber: selectedWeek,
            title: `Week ${selectedWeek}`,
            isPublished: true,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        lesson = lessonResponse.data.data;
      }

      let fileUrl = materialForm.url;

      // Upload file if not a link
      if (materialForm.type !== 'LINK' && materialForm.file) {
        const formData = new FormData();
        formData.append('file', materialForm.file);

        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        fileUrl = uploadResponse.data.url || uploadResponse.data.data?.url;
        
        if (!fileUrl) {
          throw new Error('No file URL returned from upload');
        }
      }

      // Create course material
      await axios.post(
        `${API_URL}/course-materials`,
        {
          lessonId: lesson.id,
          title: materialForm.title,
          fileUrl,
          type: materialForm.type,
          fileSize: materialForm.file?.size,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Material uploaded successfully!');
      setShowMaterialDialog(false);
      setMaterialForm({
        title: '',
        type: 'PDF',
        file: null,
        url: '',
      });
      fetchScheduleData();
    } catch (error: any) {
      console.error('Failed to upload material:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload material';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (lessonId: string, materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/course-materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Material deleted successfully!');
      fetchScheduleData();
    } catch (error) {
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    }
  };

  const getWeekLesson = (week: number) => lessons.find(l => l.weekNumber === week);
  const getWeekSchedule = (week: number) => schedule?.weeklyLessons?.find(w => w.week === week);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'VIDEO':
        return <File className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Schedule</h1>
        <p className="text-gray-600">Manage weekly topics and upload course materials</p>
        
        {schedule && (
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              {schedule.days?.join(', ') || 'Not set'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-2" />
              {schedule.time || 'Not set'}
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
          const lesson = getWeekLesson(week);
          const weekSchedule = getWeekSchedule(week);
          const isEditing = editingWeek === week;
          const materials = lesson?.courseMaterials || [];

          return (
            <Card key={week} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Week {week}: {lesson?.title || weekSchedule?.title || 'Not Set'}
                    </CardTitle>
                    {lesson?.description && (
                      <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWeek(week);
                        setShowMaterialDialog(true);
                      }}
                      className="transition-all duration-150 active:scale-95"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Material
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? setEditingWeek(null) : handleEditWeek(week)}
                      className="transition-all duration-150 active:scale-95"
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Week Title</label>
                      <Input
                        value={weekForm.title}
                        onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={weekForm.description}
                        onChange={(e) => setWeekForm({ ...weekForm, description: e.target.value })}
                        placeholder="Describe what will be covered this week..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Topics</label>
                      {weekForm.topics.map((topic, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={topic}
                            onChange={(e) => handleTopicChange(index, e.target.value)}
                            placeholder={`Topic ${index + 1}`}
                          />
                          {weekForm.topics.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTopic(index)}
                              className="transition-all duration-150 active:scale-95"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTopic}
                        className="mt-2 transition-all duration-150 active:scale-95"
                      >
                        + Add Topic
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveWeek}
                        className="bg-gradient-to-r from-church-gold to-yellow-600 transition-all duration-150 active:scale-95"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingWeek(null)}
                        className="transition-all duration-150 active:scale-95"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weekSchedule?.topics && weekSchedule.topics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Topics:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {weekSchedule.topics.map((topic, index) => (
                            <li key={index} className="text-gray-700">{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {materials.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Course Materials:</h4>
                        <div className="space-y-2">
                          {materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getMaterialIcon(material.type)}
                                <div>
                                  <p className="font-medium text-gray-900">{material.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {material.type}
                                    {material.fileSize && ` • ${(material.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(material.fileUrl, '_blank')}
                                  className="transition-all duration-150 active:scale-95"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMaterial(lesson!.id, material.id)}
                                  className="text-red-600 hover:text-red-700 transition-all duration-150 active:scale-95"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!weekSchedule?.topics?.length && materials.length === 0 && (
                      <p className="text-gray-500 italic">No content added yet for this week</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Material Dialog */}
      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Course Material - Week {selectedWeek}</DialogTitle>
            <DialogDescription>
              Add a document, PDF, or link for students to access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="e.g., Lecture Notes"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select
                value={materialForm.type}
                onValueChange={(value: any) => setMaterialForm({ ...materialForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCUMENT">Document (Word, Text)</SelectItem>
                  <SelectItem value="LINK">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {materialForm.type === 'LINK' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">File</label>
                <Input
                  type="file"
                  accept={materialForm.type === 'PDF' ? '.pdf' : '.doc,.docx,.txt'}
                  onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMaterialDialog(false)}
              className="transition-all duration-150 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadMaterial}
              disabled={uploading}
              className="bg-gradient-to-r from-church-gold to-yellow-600 transition-all duration-150 active:scale-95"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
