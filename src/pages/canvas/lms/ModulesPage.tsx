import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, FileText, ClipboardList, Clock, CheckCheck, Loader, File, FileVideo, Link as LinkIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type CompletionStatus = 'not_started' | 'pending' | 'approved';

interface Lesson {
  id: string;
  title: string;
  week: number;
  content?: string;
  completionStatus: CompletionStatus;
  courseMaterials?: CourseMaterial[];
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

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  points?: number;
}

interface WeekModule {
  week: number;
  title: string;
  lessons: Lesson[];
  assignments: Assignment[];
  completionStatus: CompletionStatus;
}

interface ModulesPageProps {
  classId: string;
}

export default function ModulesPage({ classId }: ModulesPageProps) {
  const [modules, setModules] = useState<WeekModule[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, [classId]);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch class details with schedule
      const classResponse = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const classData = classResponse.data.data;
      const schedule = classData.schedule?.weeklyLessons || [];
      const totalWeeks = classData.totalWeeks || 12; // Default to 12 weeks if not set

      console.log('Class schedule data:', {
        totalWeeks,
        hasWeeklyLessons: schedule.length > 0,
        scheduleLength: schedule.length
      });

      // Fetch lessons for this class (created by instructor)
      const lessonsResponse = await axios.get(`${API_URL}/lessons/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { data: [] } }));

      // Fetch student's progress
      const userId = localStorage.getItem('userId');
      const progressResponse = await axios.get(
        `${API_URL}/week-progress?classId=${classId}&studentId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ data: { data: [] } }));

      const lessonsData = lessonsResponse.data.data || [];
      const progressData = progressResponse.data.data || [];

      // Build modules structure
      const modulesData: WeekModule[] = [];

      for (let week = 1; week <= totalWeeks; week++) {
        const weekSchedule = schedule.find((s: any) => s.week === week);
        const weekLessons = lessonsData.filter((l: any) => l.week === week);
        const weekProgress = progressData.find((p: any) => p.weekNumber === week);

        // Determine completion status
        let completionStatus: CompletionStatus = 'not_started';
        if (weekProgress) {
          if (weekProgress.instructorApproved) {
            completionStatus = 'approved';
          } else if (weekProgress.completed) {
            completionStatus = 'pending';
          }
        }

        // If instructor has created custom lessons, use those (only published ones)
        let lessons: any[] = [];
        const publishedLessons = weekLessons.filter((l: any) => l.published);
        
        if (publishedLessons.length > 0) {
          // Use instructor-created lessons and fetch their materials
          lessons = await Promise.all(publishedLessons.map(async (lesson: any) => {
            // Fetch course materials for this lesson
            let courseMaterials: CourseMaterial[] = [];
            try {
              const materialsResponse = await axios.get(
                `${API_URL}/course-materials/lesson/${lesson.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              courseMaterials = materialsResponse.data.data || [];
            } catch (error) {
              console.error(`Failed to fetch materials for lesson ${lesson.id}:`, error);
            }

            return {
              id: lesson.id,
              title: lesson.title,
              week: lesson.week,
              content: lesson.content,
              completionStatus,
              courseMaterials,
            };
          }));
        } else if (weekSchedule) {
          // Fallback to schedule data when no custom lessons exist
          lessons = [{
            id: `schedule-${classId}-week-${week}`,
            title: weekSchedule.title || `Week ${week} Lesson`,
            week: week,
            content: `
              <div class="space-y-4">
                ${weekSchedule.objectives ? `
                  <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 class="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                        <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                      </svg>
                      Learning Objectives
                    </h3>
                    <ul class="space-y-2">
                      ${weekSchedule.objectives.map((obj: string) => `
                        <li class="flex items-start">
                          <span class="text-blue-500 mr-2">✓</span>
                          <span class="text-gray-700">${obj}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${weekSchedule.activities ? `
                  <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 class="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                      </svg>
                      Activities
                    </h3>
                    <ul class="space-y-2">
                      ${weekSchedule.activities.map((act: string) => `
                        <li class="flex items-start">
                          <span class="text-green-500 mr-2">→</span>
                          <span class="text-gray-700">${act}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `,
            completionStatus,
          }];
        }

        modulesData.push({
          week,
          title: weekSchedule?.title || `Week ${week}`,
          lessons,
          assignments: [], // Will be fetched from assignments endpoint
          completionStatus,
        });
      }

      setModules(modulesData);
      console.log('Modules built:', modulesData.length, 'weeks');
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(week)) {
        newSet.delete(week);
      } else {
        newSet.add(week);
      }
      return newSet;
    });
  };

  const markWeekComplete = async (week: number) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Immediately update UI to show pending status
      setModules((prev) =>
        prev.map((module) => {
          if (module.week === week) {
            return {
              ...module,
              completionStatus: 'pending' as CompletionStatus,
              lessons: module.lessons.map(lesson => ({
                ...lesson,
                completionStatus: 'pending' as CompletionStatus
              }))
            };
          }
          return module;
        })
      );

      // Send to backend
      await axios.post(
        `${API_URL}/week-progress`,
        {
          classId,
          studentId: userId,
          weekNumber: week,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optionally refresh to get latest data from server
      // fetchModules();
    } catch (error) {
      console.error('Failed to mark week complete:', error);
      // Revert on error
      setModules((prev) =>
        prev.map((module) => {
          if (module.week === week) {
            return {
              ...module,
              completionStatus: 'not_started' as CompletionStatus,
              lessons: module.lessons.map(lesson => ({
                ...lesson,
                completionStatus: 'not_started' as CompletionStatus
              }))
            };
          }
          return module;
        })
      );
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: CompletionStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0 animate-pulse" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />;
    }
  };

  const getStatusBadge = (status: CompletionStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCheck className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Pending Approval
          </Badge>
        );
      default:
        return null;
    }
  };

  const viewLessonDetail = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  console.log('Render check:', { loading, modulesCount: modules.length, hasSelectedLesson: !!selectedLesson });
  console.log('First 2 modules:', modules.slice(0, 2));

  // If viewing a specific lesson
  if (selectedLesson) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedLesson(null)}
          className="mb-4 hover:bg-gray-100"
        >
          ← Back to Modules
        </Button>

        <Card className="shadow-lg border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mb-2 border-blue-500 text-blue-700">
                  Week {selectedLesson.week}
                </Badge>
                <CardTitle className="text-2xl text-gray-900">{selectedLesson.title}</CardTitle>
              </div>
              {getStatusBadge(selectedLesson.completionStatus)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {selectedLesson.content ? (
              <div
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">No lesson content available</p>
                <p className="text-sm mt-2">The instructor hasn't uploaded content for this lesson yet.</p>
              </div>
            )}

            {/* Course Materials Section */}
            {selectedLesson.courseMaterials && selectedLesson.courseMaterials.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Course Materials
                </h3>
                <div className="space-y-3">
                  {selectedLesson.courseMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {material.type === 'PDF' && <File className="h-5 w-5 text-red-600" />}
                        {material.type === 'DOCUMENT' && <FileText className="h-5 w-5 text-blue-600" />}
                        {material.type === 'VIDEO' && <FileVideo className="h-5 w-5 text-purple-600" />}
                        {material.type === 'LINK' && <LinkIcon className="h-5 w-5 text-green-600" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{material.title}</p>
                          <p className="text-xs text-gray-500">
                            {material.type}
                            {material.fileSize && ` • ${formatFileSize(material.fileSize)}`}
                          </p>
                        </div>
                      </div>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        {material.type === 'PDF' ? 'View PDF' : 'Download'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLesson.completionStatus === 'not_started' && (
              <div className="mt-8 pt-6 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => markWeekComplete(selectedLesson.week)}>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-yellow-500" />
                      Submit for Approval
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {selectedLesson.completionStatus === 'pending' && (
              <div className="mt-8 pt-6 border-t">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-3 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Pending Instructor Approval</p>
                      <p className="text-xs text-yellow-700 mt-1">Your completion is awaiting review by the instructor</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLesson.completionStatus === 'approved' && (
              <div className="mt-8 pt-6 border-t">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <CheckCheck className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Completed & Approved!</p>
                      <p className="text-xs text-green-700 mt-1">Great job! This week has been approved by your instructor</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main modules view
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Course Modules
          </h1>
          <p className="text-gray-600 text-lg">
            Complete each week's lessons and assignments to progress through the course
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Approved</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {modules.map((module) => {
            const bgColor = module.completionStatus === 'approved' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : module.completionStatus === 'pending'
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
              : 'bg-white border-gray-200';
            
            const borderColor = module.completionStatus === 'approved'
              ? 'border-l-green-500'
              : module.completionStatus === 'pending'
              ? 'border-l-yellow-500'
              : 'border-l-blue-500';

            return (
              <Card key={module.week} className={`overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${borderColor} ${bgColor}`}>
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-opacity-80 transition-all"
                  onClick={() => toggleWeek(module.week)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div onClick={(e) => { e.stopPropagation(); markWeekComplete(module.week); }} className="cursor-pointer hover:scale-110 transition-transform">
                      {getStatusIcon(module.completionStatus)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">Week {module.week}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(module.completionStatus)}
                    {module.lessons.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                        <FileText className="h-3 w-3 mr-1" />
                        {module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                      </Badge>
                    )}
                    {module.assignments.length > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        {module.assignments.length} {module.assignments.length === 1 ? 'Assignment' : 'Assignments'}
                      </Badge>
                    )}
                    {expandedWeeks.has(module.week) ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedWeeks.has(module.week) && (
                  <div className="border-t bg-white bg-opacity-60 p-5">
                    {module.lessons.length === 0 && module.assignments.length === 0 ? (
                      <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="h-14 w-14 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-700 font-semibold text-lg">No lesson, no assignment</p>
                        <p className="text-sm text-gray-500 mt-2">
                          The instructor hasn't added content for this week yet
                        </p>
                        {module.completionStatus === 'not_started' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="mt-4 bg-gray-700 hover:bg-gray-800 text-white"
                                size="sm"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                markWeekComplete(module.week);
                              }}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-yellow-500" />
                                Submit for Approval
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {module.completionStatus === 'pending' && (
                          <Button
                            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse"
                            size="sm"
                            disabled
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Pending Approval
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Lessons */}
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-100 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
                            onClick={() => viewLessonDetail(lesson)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-semibold text-gray-800">{lesson.title}</span>
                            </div>
                            {getStatusIcon(lesson.completionStatus)}
                          </div>
                        ))}

                        {/* Assignments */}
                        {module.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-orange-100 hover:border-orange-400 hover:shadow-md cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <ClipboardList className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">{assignment.title}</span>
                                {assignment.points && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({assignment.points} points)
                                  </span>
                                )}
                              </div>
                            </div>
                            {assignment.dueDate && (
                              <Badge variant="outline" className="border-orange-300 text-orange-700">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        ))}

                        {module.completionStatus === 'not_started' && (module.lessons.length > 0 || module.assignments.length > 0) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="w-full mt-2 bg-gray-700 hover:bg-gray-800 text-white"
                                variant="default"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Week {module.week} Complete
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                markWeekComplete(module.week);
                              }}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-yellow-500" />
                                Submit for Approval
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {module.completionStatus === 'pending' && (module.lessons.length > 0 || module.assignments.length > 0) && (
                          <Button
                            className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse"
                            variant="default"
                            disabled
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Pending Instructor Approval
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
