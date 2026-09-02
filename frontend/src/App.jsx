import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import MarketLayout from "./layouts/MarketLayout";

// Shared Components
import UserProfile from "./components/UserProfile";

// Public Pages
import HomePage from "./pages/public/HomePage";
import CoursesPage from "./pages/public/CoursesPage";
import CourseDetailPage from "./pages/public/CourseDetailPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";

// Student Pages
import DashboardPage from "./pages/student/DashboardPage";
import ApplyPage from "./pages/student/ApplyPage";
import MyApplicationsPage from "./pages/student/MyApplicationsPage";
import MyPaymentsPage from "./pages/student/MyPaymentsPage";
import AnnouncementsPage from "./pages/student/AnnouncementsPage";
import CertificatesPage from "./pages/student/CertificatesPage";

// Instructor Pages
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import InstructorCoursesPage from "./pages/instructor/InstructorCoursesPage";
import InstructorStudentsPage from "./pages/instructor/InstructorStudentsPage";
import InstructorAnnouncementsPage from "./pages/instructor/InstructorAnnouncementsPage";
import InstructorCertificatesPage from "./pages/instructor/InstructorCertificatesPage";

// Market Officer Pages
import MarketDashboardPage from "./pages/market/MarketDashboardPage";
import ManageInstructorsPage from "./pages/market/ManageInstructorsPage";
import MarketCategoriesPage from "./pages/market/MarketCategoriesPage";
import MarketCoursesPage from "./pages/market/MarketCoursesPage";
import MarketInstructorsPage from "./pages/market/MarketInstructorsPage";
import MarketSettingsPage from "./pages/market/MarketSettingsPage";

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Student Portal Routes */}
      <Route element={<StudentLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/intakes/:intakeId/apply" element={<ApplyPage />} />
        <Route path="/applications" element={<MyApplicationsPage />} />
        <Route path="/payments" element={<MyPaymentsPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/student/profile" element={<UserProfile />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
      </Route>

      {/* Instructor Portal Routes */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboardPage />} />
        <Route path="courses" element={<InstructorCoursesPage />} />
        <Route path="students" element={<InstructorStudentsPage />} />
        <Route path="announcements" element={<InstructorAnnouncementsPage />} />
        <Route path="certificates" element={<InstructorCertificatesPage />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Market Officer Portal Routes */}
      <Route path="/market" element={<MarketLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MarketDashboardPage />} />
        <Route path="courses" element={<MarketCoursesPage />} />
        <Route path="categories" element={<MarketCategoriesPage />} />
        <Route path="instructors" element={<MarketInstructorsPage />} />
        <Route path="manage-instructors" element={<ManageInstructorsPage />} />
        <Route path="settings" element={<MarketSettingsPage />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}