
import { createContext, useContext, useState } from "react";
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  async function login(email, password) {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
    });

    const loginData = response.data;

    // Backend LoginResponse:
    // {
    //   token,
    //   userId,
    //   email,
    //   role
    // }

    const loggedInUser = {
      userId: loginData.userId,
      email: loginData.email,
      role: loginData.role,
    };

    // Store JWT for authenticated API requests.
    localStorage.setItem("scms_token", loginData.token);

    // Store basic logged-in user information.
    localStorage.setItem("scms_user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);

    return loggedInUser;
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

    return response.data;
  }

  async function updateProfile(profileData) {
    const updatedUser = {
      ...user,
      ...profileData,
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
    localStorage.removeItem("scms_user");
  }

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

