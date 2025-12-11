import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ClassesPage from "./pages/classes/ClassesPage";
import InstructorsPage from "./pages/instructors/InstructorsPage";
import StudentsPage from "./pages/students/StudentsPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ProfilePage from "./pages/profile/ProfilePage";

// Layout
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/instructors" element={<InstructorsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Add more dashboard routes as needed */}
              <Route path="/my-classes" element={<ClassesPage />} />
              <Route path="/enrolled-classes" element={<ClassesPage />} />
              <Route path="/schedule" element={<AttendancePage />} />
              <Route path="/browse-classes" element={<ClassesPage />} />
              <Route path="/calendar" element={<AttendancePage />} />
              <Route path="/messages" element={<DashboardPage />} />
              <Route path="/reports" element={<DashboardPage />} />
              <Route path="/settings" element={<ProfilePage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
