// src/App.jsx
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import PortalLayout from "./components/PortalLayout";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import Instructor from "./pages/instructor/Instructor.jsx";
import MyCoursesPage from "./pages/instructor/MyCoursesPage.jsx";
import CourseWorkspacePage from "./pages/instructor/CourseWorkspacePage.jsx";
import CourseStudentsPage from "./pages/instructor/CourseStudentsPage.jsx";
import SubmissionsPage from "./pages/instructor/SubmissionsPage.jsx";
import MessagesPage from "./pages/instructor/MessagesPage.jsx";

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

      <Route element={<PortalLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/instructor/courses" element={<MyCoursesPage />} />
        <Route path="/instructor/courses/:courseId" element={<CourseWorkspacePage />} />
        <Route path="/instructor/courses/:courseId/students" element={<CourseStudentsPage />} />
        <Route path="/instructor/submissions" element={<SubmissionsPage />} />
        <Route path="/instructor/messages" element={<MessagesPage />} />
      </Route>
    </Routes>
  );
}