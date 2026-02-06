import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ClassesPage from "./pages/classes/ClassesPage";
import ClassDetails from "./pages/classes/ClassDetails";
import InstructorsPage from "./pages/instructors/InstructorsPage";
import InstructorProfile from "./pages/instructors/InstructorProfile";
import StudentsPage from "./pages/students";
import AttendancePage from "./pages/attendance";
import ProfilePage from "./pages/profile/ProfilePage";
import EnrollmentPage from "./pages/enrollment/EnrollmentPage";
import InstructorEnrollmentPage from "./pages/enrollment/InstructorEnrollmentPage";
import CanvasRouter from "./pages/canvas/CanvasRouter";

// Layout
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/instructor/:id" element={<InstructorProfile />} />
            <Route path="/class/:id" element={<ClassDetails />} />
            <Route path="/enrollment/:classId" element={<EnrollmentPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Canvas LMS - Full Screen (No Dashboard Layout) - Routes to instructor or student canvas based on role */}
            <Route path="/canvas/:classId" element={<CanvasRouter />} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/instructors" element={<InstructorsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/enrollment-approvals" element={<InstructorEnrollmentPage />} />
              <Route path="/enrollments" element={<InstructorEnrollmentPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Instructor routes */}
              <Route path="/my-classes" element={<ClassesPage />} />
              <Route path="/enrolled-classes" element={<ClassesPage />} />
              <Route path="/calendar" element={<AttendancePage />} />
              {/* Admin routes */}
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
  </ErrorBoundary>
);

export default App;
