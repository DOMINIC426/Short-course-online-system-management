
import { createContext, useContext, useState, useEffect } from "react";
import { api, getApiErrorMessage } from "../api/backendClient.js";

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

  const token = data.token || data.accessToken || data.jwt || "";
  return {
    id: data.id || data.userId || "",

    firstName: data.firstName || data.first_name || "",
    lastName: data.lastName || data.last_name || "",
    email: data.email || "",
    phone: data.phone || data.phoneNumber || "",
    role: data.role || "STUDENT",
    token,
    ...normalizeProfileFields(data),
  };
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function fetchUserProfile(targetUser = user) {
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
      console.warn("Skipping profile fetch:", err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("scms_token");
    if (token && user) {
      fetchUserProfile(user);
    }
  }, []);


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


  
  async function register({ firstName, lastName, email, phone, password }) {
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      phoneNumber: phone.trim(),
      password,
      role: "STUDENT",
    };

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

  async function forgotPassword(identifier) {
    const response = await api.post("/api/v1/auth/forgot-password", { identifier });

    return response.data;
  }

  async function resetPassword(token, newPassword) {

    const response = await api.post("/api/v1/auth/reset-password", { token, newPassword });

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
        fetchUserProfile,
        updateProfile,

      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

