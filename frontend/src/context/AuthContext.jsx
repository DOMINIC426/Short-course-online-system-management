import { createContext, useContext, useState } from "react";
import { api } from "../api/backendClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const response = await api.post("/api/auth/login", { username, password });
    const loggedInUser = response.data;
    setUser(loggedInUser);
    localStorage.setItem("scms_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  }

  async function register(fullName, username, password) {
    const response = await api.post("/api/auth/register", { fullName, username, password });
    return response.data;
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
    localStorage.removeItem("scms_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}