import { createContext, useContext, useState } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const loggedInUser = response.data;
      setUser(loggedInUser);
      localStorage.setItem("scms_user", JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      // TEMPORARY fallback until backend auth is ready — remove once CORS/endpoint is fixed
      const fakeUser = {
        firstName: "Test",
        lastName: "Student",
        email,
        role: "STUDENT",
      };
      setUser(fakeUser);
      localStorage.setItem("scms_user", JSON.stringify(fakeUser));
      return fakeUser;
    }
  }

  async function register({ firstName, lastName, email, password }) {
    try {
      const response = await api.post("/api/auth/register", {
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
  try {
    const response = await api.post("/api/students/me", {
      level_of_education: levelOfEducation,
      nationality,
      identification_number: identificationNumber,
    });
    const updatedUser = { ...user, ...response.data };
    setUser(updatedUser);
    localStorage.setItem("scms_user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (err) {
    // TEMPORARY fallback until backend endpoint is ready — to be removed once connected
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
}
  async function forgotPassword(email) {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  }

  async function resetPassword(token, newPassword) {
    const response = await api.post("/api/auth/reset-password", { token, newPassword });
    return response.data;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("scms_user");
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, forgotPassword, resetPassword, updateProfile}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}