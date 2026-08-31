import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
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
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      
      const token = typeof response.data === "string" ? response.data : response.data.token;
      const claims = decodeToken(token);

      const extractedRole =
        response.data.role ||
        claims?.role ||
        (Array.isArray(claims?.roles) ? claims.roles[0] : null) ||
        (Array.isArray(claims?.authorities) ? claims.authorities[0] : null) ||
        "STUDENT";

      const loggedInUser = {
        username: claims?.sub || email,
        firstName: claims?.sub || email,
        lastName: "",
        email: claims?.sub || email,
        role: String(extractedRole).toUpperCase().replace("ROLE_", ""),
        token,
      };

      setUser(loggedInUser);
      localStorage.setItem("scms_token", token);
      localStorage.setItem("scms_user", JSON.stringify(loggedInUser));

      // Fetch student profile only if logged in user has the STUDENT role
      if (loggedInUser.role === "STUDENT") {
        await fetchUserProfile(loggedInUser);
      }

      return loggedInUser;
    } catch (err) {
      throw new Error("Invalid email or password. Please try again.");
    }
  }

  async function register({ firstName, lastName, email, phone, password }) {
    try {
      const response = await api.post("/api/v1/student/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        password,
      });

      return response.data;
    } catch (err) {
      const data = err.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (typeof data === "string") {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new Error(errorMessage);
    }
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