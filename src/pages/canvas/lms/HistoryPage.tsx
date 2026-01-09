import { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface HistoryItem {
  id: string;
  type: 'attendance' | 'submission' | 'grade' | 'completion';
  title: string;
  description: string;
  timestamp: string;
  status?: 'approved' | 'rejected' | 'pending';
  metadata?: any;
}

interface HistoryPageProps {
  classId: string;
}

export default function HistoryPage({ classId }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'attendance' | 'submissions' | 'grades'>('all');

  useEffect(() => {
    fetchHistory();
  }, [classId]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Fetch all history-related data
      const [attendanceRes, submissionsRes, gradesRes, progressRes] = await Promise.all([
        axios.get(`${API_URL}/attendance?classId=${classId}&studentId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        
        axios.get(`${API_URL}/submissions?classId=${classId}&studentId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        
        axios.get(`${API_URL}/grades?classId=${classId}&studentId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        
        axios.get(`${API_URL}/week-progress?classId=${classId}&studentId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      const historyItems: HistoryItem[] = [];

      // Process attendance
      (attendanceRes.data.data || []).forEach((attendance: any) => {
        historyItems.push({
          id: `attendance-${attendance.id}`,
          type: 'attendance',
          title: 'Attendance Recorded',
          description: `Attended class on ${new Date(attendance.date).toLocaleDateString()}`,
          timestamp: attendance.createdAt,
          status: attendance.status.toLowerCase(),
        });
      });

      // Process submissions
      (submissionsRes.data.data || []).forEach((submission: any) => {
        historyItems.push({
          id: `submission-${submission.id}`,
          type: 'submission',
          title: `Submitted: ${submission.assignment.title}`,
          description: submission.content || 'Assignment submitted',
          timestamp: submission.submittedAt,
          status: submission.status.toLowerCase(),
        });
      });

      // Process grades
      (gradesRes.data.data || []).forEach((grade: any) => {
        historyItems.push({
          id: `grade-${grade.id}`,
          type: 'grade',
          title: `Graded: ${grade.assignment.title}`,
          description: `Scored ${grade.score} out of ${grade.assignment.points} points`,
          timestamp: grade.gradedAt,
          metadata: { score: grade.score, total: grade.assignment.points },
        });
      });

      // Process week completions
      (progressRes.data.data || []).filter((p: any) => p.completed).forEach((progress: any) => {
        historyItems.push({
          id: `completion-${progress.id}`,
          type: 'completion',
          title: `Completed Week ${progress.week}`,
          description: `Marked week ${progress.week} as complete`,
          timestamp: progress.completedAt || progress.updatedAt,
        });
      });

      // Sort by timestamp (newest first)
      historyItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setHistory(historyItems);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'submission':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'grade':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <HistoryIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => {
        if (filter === 'attendance') return item.type === 'attendance';
        if (filter === 'submissions') return item.type === 'submission';
        if (filter === 'grades') return item.type === 'grade';
        return true;
      });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Class History</h1>
        <p className="text-gray-600 mb-6">
          Your activity timeline for this class
        </p>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Badge
            className={`cursor-pointer ${filter === 'all' ? 'bg-church-gold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('all')}
          >
            All Activity
          </Badge>
          <Badge
            className={`cursor-pointer ${filter === 'attendance' ? 'bg-church-gold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('attendance')}
          >
            Attendance
          </Badge>
          <Badge
            className={`cursor-pointer ${filter === 'submissions' ? 'bg-church-gold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('submissions')}
          >
            Submissions
          </Badge>
          <Badge
            className={`cursor-pointer ${filter === 'grades' ? 'bg-church-gold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setFilter('grades')}
          >
            Grades
          </Badge>
        </div>

        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-600">
                Your class activity will appear here as you participate
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <Card key={item.id} className="hover:border-church-gold transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        {item.status && getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(item.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {index === 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">Latest</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
