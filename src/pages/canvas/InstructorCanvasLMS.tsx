import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  BookOpen, 
  Mail, 
  Users,
  ClipboardCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Import Instructor LMS Pages 
import InstructorAnnouncementsPage from './instructor-lms/InstructorAnnouncementsPage';
import InstructorModulesPage from './instructor-lms/InstructorModulesPage';
import InstructorInboxPage from './instructor-lms/InstructorInboxPage';
import InstructorPeoplePage from './instructor-lms/InstructorPeoplePage';
import InstructorAssignmentsPage from './instructor-lms/InstructorAssignmentsPage';
import InstructorGradebookPage from './instructor-lms/InstructorGradebookPage';
import InstructorSettingsPage from './instructor-lms/InstructorSettingsPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type InstructorLMSPage = 'announcements' | 'modules' | 'assignments' | 'inbox' | 'people' | 'gradebook' | 'settings';

interface ClassData {
  id: string;
  name: string;
  category?: string;
  status: string;
  maxCapacity: number;
  _count?: {
    enrollments: number;
  };
}

export default function InstructorCanvasLMS() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<InstructorLMSPage>('modules');
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchClassData();
    fetchNotifications();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch unread messages count
      const messagesRes = await axios.get(`${API_URL}/messages/class/${classId}?unread=true`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { data: [] } }));
      
      setUnreadMessages(messagesRes.data.data?.length || 0);

      // Fetch pending approvals (module completions + assignment submissions)
      const approvalsRes = await axios.get(`${API_URL}/week-progress?classId=${classId}&status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { data: [] } }));
      
      setPendingApprovals(approvalsRes.data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const lmsNavItems = [
    { id: 'announcements' as InstructorLMSPage, label: 'Announcements', icon: Megaphone, badge: null },
    { id: 'modules' as InstructorLMSPage, label: 'Modules & Content', icon: BookOpen, badge: pendingApprovals },
    { id: 'assignments' as InstructorLMSPage, label: 'Assignments', icon: ClipboardCheck, badge: null },
    { id: 'inbox' as InstructorLMSPage, label: 'Inbox', icon: Mail, badge: unreadMessages },
    { id: 'people' as InstructorLMSPage, label: 'Students', icon: Users, badge: null },
    { id: 'gradebook' as InstructorLMSPage, label: 'Gradebook', icon: GraduationCap, badge: null },
    { id: 'settings' as InstructorLMSPage, label: 'Settings', icon: Settings, badge: null },
  ];

  const renderPage = () => {
    if (!classId) return null;

    switch (currentPage) {
      case 'announcements':
        return <InstructorAnnouncementsPage classId={classId} />;
      case 'modules':
        return <InstructorModulesPage classId={classId} onPendingChange={(count) => setPendingApprovals(count)} />;
      case 'assignments':
        return <InstructorAssignmentsPage classId={classId} />;
      case 'inbox':
        return <InstructorInboxPage classId={classId} onUnreadChange={(count) => setUnreadMessages(count)} />;
      case 'people':
        return <InstructorPeoplePage classId={classId} />;
      case 'gradebook':
        return <InstructorGradebookPage classId={classId} />;
      case 'settings':
        return <InstructorSettingsPage classId={classId} classData={classData} onUpdate={fetchClassData} />;
      default:
        return <InstructorModulesPage classId={classId} onPendingChange={(count) => setPendingApprovals(count)} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-gold"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-700 p-4 z-50 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-white truncate flex-1 mx-4">
          {classData?.name}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Instructor Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-72
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        border-r border-slate-700 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${classData?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
              <span className="text-xs text-slate-400">{classData?.status}</span>
            </div>
          </div>
          
          <h2 className="font-semibold text-lg text-white line-clamp-2 mb-2">
            {classData?.name}
          </h2>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300 hidden sm:inline">Instructor Dashboard</span>
            <span className="text-slate-300 sm:hidden text-xs">Instructor</span>
          </div>
          
          {classData?.category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-church-gold/20 text-church-gold rounded border border-church-gold/30">
              {classData.category}
            </span>
          )}

          {/* Quick Stats */}
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Enrolled</span>
              <span className="text-white font-semibold">
                {classData?._count?.enrollments || 0} / {classData?.maxCapacity}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {lmsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-church-gold to-yellow-600 text-white shadow-lg transform scale-105' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 text-center">
            <div className="font-medium text-slate-300 mb-1">
              {user?.firstName} {user?.lastName}
            </div>
            <div>Instructor Portal</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30 pt-16 lg:pt-0">
        {renderPage()}
      </main>
    </div>
  );
}
