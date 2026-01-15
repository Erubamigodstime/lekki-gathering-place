import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  BookOpen, 
  Mail, 
  History, 
  Award, 
  GraduationCap,
  Users,
  X,
  ChevronLeft,
  ClipboardCheck,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// Import LMS Pages 
import AnnouncementsPage from './lms/AnnouncementsPage';
import ModulesPage from './lms/ModulesPage';
import AssignmentsPage from './lms/AssignmentsPage';
import InboxPage from './lms/InboxPage';
import PeoplePage from './lms/PeoplePage';
import HistoryPage from './lms/HistoryPage';
import CertificatesPage from './lms/CertificatesPage';
import GradesPage from './lms/GradesPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

type LMSPage = 'announcements' | 'modules' | 'assignments' | 'inbox' | 'people' | 'history' | 'certificates' | 'grades';

interface ClassData {
  id: string;
  name: string;
  category?: string;
  instructor: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function CanvasLMS() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<LMSPage>('modules');
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; name: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchClassData();
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

  const handleMessageUser = (userId: string, userName: string) => {
    setSelectedRecipient({ id: userId, name: userName });
    setCurrentPage('inbox');
  };

  const lmsNavItems = [
    { id: 'announcements' as LMSPage, label: 'Announcements', icon: Megaphone },
    { id: 'assignments' as LMSPage, label: 'Assignments', icon: ClipboardCheck },
    { id: 'modules' as LMSPage, label: 'Modules', icon: BookOpen },
    { id: 'inbox' as LMSPage, label: 'Inbox', icon: Mail },
    { id: 'people' as LMSPage, label: 'People', icon: Users },
    { id: 'history' as LMSPage, label: 'History', icon: History },
    { id: 'certificates' as LMSPage, label: 'Certificates', icon: Award },
    { id: 'grades' as LMSPage, label: 'Grades', icon: GraduationCap },
  ];

  const renderPage = () => {
    if (!classId) return null;

    switch (currentPage) {
      case 'announcements':
        return <AnnouncementsPage classId={classId} />;
      case 'assignments':
        return <AssignmentsPage classId={classId} />;
      case 'modules':
        return <ModulesPage classId={classId} />;
      case 'inbox':
        return <InboxPage classId={classId} preSelectedRecipient={selectedRecipient} onClearRecipient={() => setSelectedRecipient(null)} />;
      case 'people':
        return <PeoplePage classId={classId} onMessageUser={handleMessageUser} />;
      case 'history':
        return <HistoryPage classId={classId} />;
      case 'certificates':
        return <CertificatesPage classId={classId} />;
      case 'grades':
        return <GradesPage classId={classId} />;
      default:
        return <ModulesPage classId={classId} />;
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

      {/* LMS Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-64
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        border-r border-slate-700 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="font-semibold text-lg text-white line-clamp-2">
            {classData?.name}
          </h2>
          {classData?.instructor && (
            <p className="text-sm text-slate-300 mt-1">
              {classData.instructor.user.firstName} {classData.instructor.user.lastName}
            </p>
          )}
          {classData?.category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-church-gold/20 text-church-gold rounded border border-church-gold/30">
              {classData.category}
            </span>
          )}
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
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-church-gold to-yellow-600 text-white shadow-lg transform scale-105' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 text-center">
            © 2026 YSA Gathering Place
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        {renderPage()}
      </main>
    </div>
  );
}
