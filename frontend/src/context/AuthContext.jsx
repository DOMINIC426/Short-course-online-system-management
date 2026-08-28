import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    if (typeof token !== "string") return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
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

  // Fetch full user details from backend DB whenever a session exists
  async function fetchUserProfile() {
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
      console.warn("Could not fetch current student profile from backend:", err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("scms_token");
    if (token) {
      fetchUserProfile();
    }
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email: email.trim(),
        password,
      });

      const token =
        typeof response.data === "string"
          ? response.data
          : response.data?.token || response.data?.accessToken;

      if (token) {
        localStorage.setItem("scms_token", token);
      }

      const claims = decodeToken(token);

      const loggedInUser = {
        username: email,
        firstName: response.data?.firstName || claims?.firstName || "",
        lastName: response.data?.lastName || claims?.lastName || "",
        email: claims?.email || email,
        role: String(claims?.role || response.data?.role || "STUDENT").toUpperCase(),
        token,
      };

      setUser(loggedInUser);
      localStorage.setItem("scms_user", JSON.stringify(loggedInUser));

      // Trigger profile fetch from database immediately after successful login
      await fetchUserProfile();

      return loggedInUser;
    } catch (err) {
      const serverError = err.response?.data;
      const message =
        (typeof serverError === "string"
          ? serverError
          : serverError?.message || serverError?.error) ||
        "Invalid email or password.";
      throw new Error(message);
    }
  }

  async function register({ firstName, lastName, email, phone, password }) {
    try {
      const response = await api.post("/api/v1/student/register", {
        firstName,
        lastName,
        email,
        phone,
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

  async function logout() {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (err) {
      console.warn("Backend logout request failed or session already expired:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("scms_token");
      localStorage.removeItem("scms_user");
    }
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