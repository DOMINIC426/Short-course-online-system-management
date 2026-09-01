import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

function normalizeProfileFields(data) {
  return {
    levelOfEducation: data.levelOfEducation ?? data.level_of_education ?? "",
    nationality: data.nationality ?? "",
    identificationNumber: data.identificationNumber ?? data.identification_number ?? "",
  };
}

function normalizeUserResponse(data) {
  // Map response fields to normalized user object
  return {
    id: data.id || data.userId,
    firstName: data.firstName || data.first_name || "",
    lastName: data.lastName || data.last_name || "",
    email: data.email || "",
    phone: data.phone || "",
    role: data.role || "STUDENT",
    token: data.token || "",
    ...normalizeProfileFields(data),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function fetchUserProfile(targetUser = user) {
    // Skip profile fetch if the user is not a student (e.g., INSTRUCTOR)
    if (targetUser?.role && targetUser.role !== "STUDENT") {
      return;
    }

    try {
      const response = await api.get("/api/v1/student/profile");
      const profileData = response.data;

      if (profileData) {
        setUser((prev) => {
          const updatedUser = {
            ...prev,
            firstName: profileData.firstName || prev?.firstName || "",
            lastName: profileData.lastName || prev?.lastName || "",
            email: profileData.email || prev?.email || "",
            nationality: profileData.nationality || prev?.nationality || "",
            levelOfEducation: profileData.levelOfEducation || prev?.levelOfEducation || "",
            identificationNumber: profileData.identificationNumber || prev?.identificationNumber || "",
          };
          localStorage.setItem("scms_user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.warn("Skipping profile fetch for non-student or missing record:", err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("scms_token");
    if (token && user) {
      fetchUserProfile(user);
    }
  }, []);

  async function login(email, password) {
    const response = await api.post("/api/v1/auth/login", { email, password });
    const loggedInUser = normalizeUserResponse(response.data);
    setUser(loggedInUser);
    localStorage.setItem("scms_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  }

  async function register({ firstName, lastName, email, phone, password }) {
    const response = await api.post("/api/v1/auth/register", {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "STUDENT",
    });

    const registeredUser = normalizeUserResponse(response.data);
    setUser(registeredUser);
    localStorage.setItem("scms_user", JSON.stringify(registeredUser));
    return registeredUser;
  }

  async function updateProfile({ levelOfEducation, nationality, identificationNumber }) {
    const updatedUser = { ...user, levelOfEducation, nationality, identificationNumber };
    setUser(updatedUser);
    localStorage.setItem("scms_user", JSON.stringify(updatedUser));
    return updatedUser;
  }

  async function forgotPassword(identifier) {
    const response = await api.post("/api/auth/forgot-password", { identifier });
    return response.data;
  }

  async function resetPassword(token, newPassword) {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("scms_token");
    localStorage.removeItem("scms_user");
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, forgotPassword, resetPassword, fetchUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}