import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is in the list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on their role
    const rolePathMap = {
      STUDENT: "/dashboard",
      ADMIN: "/admin/dashboard",
      COORDINATOR: "/coordinator/dashboard",
      INSTRUCTOR: "/instructor/dashboard",
      MARKETING_OFFICER: "/market/dashboard",
    };
    const redirectPath = rolePathMap[user.role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
