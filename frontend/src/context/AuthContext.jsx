
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("scms_user");
    return null;
  }
}

function normalizeProfileFields(data) {
  return {
    levelOfEducation:
      data.levelOfEducation ?? data.level_of_education ?? "",
    nationality: data.nationality ?? "",
    identificationNumber:
      data.identificationNumber ??
      data.identification_number ??
      "",
  };
}

function normalizeUserResponse(data) {
  return {
    id: data.id || data.userId,
    userId: data.userId || data.id,
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
  const [user, setUser] = useState(getStoredUser);

  function storeAuthSession(userData) {
    const normalizedUser = normalizeUserResponse(userData);

    if (normalizedUser.token) {
      localStorage.setItem("scms_token", normalizedUser.token);
      localStorage.setItem("token", normalizedUser.token);
      localStorage.setItem("jwt", normalizedUser.token);
    }

    const { token, ...storedUser } = normalizedUser;

    localStorage.setItem("scms_user", JSON.stringify(storedUser));
    setUser(storedUser);

    return storedUser;
  }

  async function login(email, password) {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
    });

    return storeAuthSession(response.data);
  }

  async function register({
    firstName,
    lastName,
    email,
    phone,
    password,
  }) {
    const response = await api.post("/api/v1/auth/register", {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      role: "STUDENT",
    });

    if (response.data?.token) {
      return storeAuthSession(response.data);
    }

    return response.data;
  }

  async function fetchUserProfile(targetUser = user) {
    // Only students have access to the student profile endpoint.
    if (!targetUser || targetUser.role !== "STUDENT") {
      return targetUser;
    }

    try {
      const response = await api.get("/api/v1/student/profile");
      const profileData = response.data || {};

      const updatedUser = {
        ...targetUser,
        firstName:
          profileData.firstName ||
          profileData.first_name ||
          targetUser.firstName ||
          "",
        lastName:
          profileData.lastName ||
          profileData.last_name ||
          targetUser.lastName ||
          "",
        email: profileData.email || targetUser.email || "",
        phone: profileData.phone || targetUser.phone || "",
        ...normalizeProfileFields(profileData),
      };

      setUser(updatedUser);
      localStorage.setItem("scms_user", JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.warn(
        "Skipping profile fetch for non-student or missing record:",
        error
      );
      return targetUser;
    }
  }

  async function updateProfile({
    levelOfEducation,
    nationality,
    identificationNumber,
  }) {
    const updatedUser = {
      ...user,
      levelOfEducation,
      nationality,
      identificationNumber,
    };

    setUser(updatedUser);
    localStorage.setItem("scms_user", JSON.stringify(updatedUser));

    return updatedUser;
  }

  async function forgotPassword(email) {
    const response = await api.post("/api/v1/auth/forgot-password", {
      email,
    });

    return response.data;
  }

  async function resetPassword(token, newPassword) {
    const response = await api.post("/api/v1/auth/reset-password", {
      token,
      newPassword,
    });

    return response.data;
  }

  function logout() {
    setUser(null);

    localStorage.removeItem("scms_token");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("scms_user");
  }

  useEffect(() => {
    if (user?.role === "STUDENT" && localStorage.getItem("scms_token")) {
      fetchUserProfile(user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

