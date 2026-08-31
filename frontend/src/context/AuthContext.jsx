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
      const response = await api.post("/api/v1/auth/login", { email: username, password });
      const token = response.data;
      const claims = decodeToken(token);
      const loggedInUser = {
        username: claims?.sub || username,
        firstName: claims?.sub || username,
        lastName: "",
        email: claims?.sub || username,
        role: String(claims?.role || "STUDENT").toUpperCase(),
        token,
      };
      setUser(loggedInUser);
      localStorage.setItem("scms_token", token);
      localStorage.setItem("scms_user", JSON.stringify(loggedInUser));

      await fetchUserProfile();

      return loggedInUser;
    } catch (err) {
      // TEMPORARY fallback until backend auth is ready — remove once CORS/endpoint is fixed
      const fakeRole = username.toLowerCase().includes("instructor") ? "INSTRUCTOR" : "STUDENT";
      const fakeUser = {
        username,
        firstName: username,
        lastName: "",
        email: "",
        phone: "",
        role: fakeRole,
      };
      setUser(fakeUser);
      localStorage.removeItem("scms_token");
      localStorage.setItem("scms_user", JSON.stringify(fakeUser));
      return fakeUser;
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