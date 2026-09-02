// src/App.jsx
import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import RolesPage from "./pages/admin/RolesPage";
import PermissionsPage from "./pages/admin/PermissionsPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import HomePage from "./pages/public/HomePage";
import CoursesPage from "./pages/public/CoursesPage";
import CourseDetailPage from "./pages/public/CourseDetailPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import DashboardPage from "./pages/student/DashboardPage";
import ProfilePage from "./pages/student/ProfilePage";
import ApplyPage from "./pages/student/ApplyPage";
import MyApplicationsPage from "./pages/student/MyApplicationsPage";
import MyPaymentsPage from "./pages/student/MyPaymentsPage";
import AnnouncementsPage from "./pages/student/AnnouncementsPage";
import CertificatesPage from "./pages/student/CertificatesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<StudentLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/intakes/:intakeId/apply" element={<ApplyPage />} />
        <Route path="/applications" element={<MyApplicationsPage />} />
        <Route path="/payments" element={<MyPaymentsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
      </Route>
    <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
    <Route path="/admin/users" element={<UserManagementPage />} />
    <Route path="/admin/roles" element={<RolesPage />} />
    <Route path="/admin/permissions" element={<PermissionsPage />} />
    <Route path="/admin/settings" element={<SystemSettingsPage />} />
    <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
    </Route>
    </Routes>
  );
}

