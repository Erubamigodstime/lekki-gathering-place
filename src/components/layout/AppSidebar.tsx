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
  { title: 'Enrolled Classes', url: '/enrolled-classes', icon: GraduationCap },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'Profile', url: '/profile', icon: UserCircle },
];

const studentNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Schedule', url: '/schedule', icon: Calendar },
  { title: 'Browse Classes', url: '/browse-classes', icon: BookOpen },
  { title: 'Attendance', url: '/attendance', icon: ClipboardCheck },
  { title: 'Messages', url: '/messages', icon: MessageSquare },
  { title: 'Profile', url: '/profile', icon: UserCircle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const navItems = user?.role === 'admin' 
    ? adminNavItems 
    : user?.role === 'instructor' 
      ? instructorNavItems 
      : studentNavItems;

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'instructor': return 'Instructor';
      case 'student': return 'Student';
      default: return '';
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <ChurchLogo size="md" showText={!collapsed} />
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
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
