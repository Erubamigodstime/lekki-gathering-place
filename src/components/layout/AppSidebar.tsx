import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Settings,
  MessageSquare,
  UserCircle,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { ChurchLogo } from '@/components/ChurchLogo';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Instructors', url: '/instructors', icon: GraduationCap },
  { title: 'Students', url: '/students', icon: Users },
  { title: 'Classes', url: '/classes', icon: BookOpen },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const instructorNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Classes', url: '/my-classes', icon: BookOpen },
  { title: 'Enrollments', url: '/enrollment-approvals', icon: GraduationCap },
  { title: 'Students', url: '/students', icon: Users },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Profile', url: '/profile', icon: UserCircle },
];

const studentNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Browse Classes', url: '/classes', icon: BookOpen },
  { title: 'My Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Profile', url: '/profile', icon: UserCircle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const navItems = user?.role?.toLowerCase() === 'admin' 
    ? adminNavItems 
    : user?.role?.toLowerCase() === 'instructor' 
      ? instructorNavItems 
      : studentNavItems;

  const getRoleLabel = () => {
    switch (user?.role?.toLowerCase()) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'student': return 'Student';
      default: return '';
    }
  };

  // Close sidebar on mobile when navigation occurs
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <ChurchLogo size="md" showText={!collapsed} textClassName="text-sidebar-foreground" />
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-3 text-xs font-bold text-sidebar-foreground/60 uppercase tracking-widest">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 font-medium"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-lg hover:bg-sidebar-primary/90"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent border border-sidebar-border/30">
              <Avatar className="h-11 w-11 ring-2 ring-sidebar-primary/20">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 font-medium">{getRoleLabel()}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-950/20 transition-colors"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
