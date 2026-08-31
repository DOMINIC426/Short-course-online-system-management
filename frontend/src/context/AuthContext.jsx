import { createContext, useContext, useState } from "react";
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

  async function register({ firstName, lastName, email, password }) {
    try {
      const response = await api.post("/api/v1/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: "STUDENT",
      });
      return response.data;
    } catch (err) {
      // TEMPORARY fallback until backend auth is ready — remove once CORS/endpoint is fixed
      return { firstName, lastName, email };
    }
  }

  async function updateProfile({ levelOfEducation, nationality, identificationNumber }) {
    const updatedUser = { ...user, levelOfEducation, nationality, identificationNumber };
    setUser(updatedUser);
    localStorage.setItem("scms_user", JSON.stringify(updatedUser));
    return updatedUser;
  }

  async function forgotPassword(email) {
    const response = await api.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  }

  async function resetPassword(token, newPassword) {
    const response = await api.post("/api/v1/auth/reset-password", { token, newPassword });
    return response.data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("scms_token");
    localStorage.removeItem("scms_user");
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, forgotPassword, resetPassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}