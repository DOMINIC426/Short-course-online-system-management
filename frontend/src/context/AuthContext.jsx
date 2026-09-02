import { createContext, useContext, useState, useEffect } from "react";
import { api, getApiErrorMessage } from "../api/backendClient.js";

const AuthContext = createContext(null);

function normalizeProfileFields(data) {
  return {
    levelOfEducation: data.levelOfEducation ?? data.level_of_education ?? "",
    nationality: data.nationality ?? "",
    identificationNumber: data.identificationNumber ?? data.identification_number ?? "",
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
    const nextUser = normalizeUserResponse(userData);
    setUser(nextUser);
    localStorage.setItem("scms_user", JSON.stringify(nextUser));

    if (nextUser.token) {
      localStorage.setItem("scms_token", nextUser.token);
      localStorage.setItem("token", nextUser.token);
      localStorage.setItem("jwt", nextUser.token);
    }

    return nextUser;
  }

  async function login(email, password) {
<<<<<<< HEAD
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      const loggedInUser = normalizeUserResponse(response.data);

      if (loggedInUser.token) {
        localStorage.setItem("scms_token", loggedInUser.token);
      }
      localStorage.setItem("scms_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return loggedInUser;
    } catch (err) {
      const message = getApiErrorMessage(err, "Invalid email or password. Please try again.");
      const wrapped = new Error(message);
      wrapped.response = err.response;
      throw wrapped;
    }
=======
    const response = await api.post("/api/v1/auth/login", { email, password });
    return storeAuthSession(response.data);
>>>>>>> 683af069581fb3cd778284919d370fa83ac840f5
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

<<<<<<< HEAD
    let response;
    try {
      response = await api.post("/api/v1/auth/register", payload);
    } catch (firstErr) {
      if (firstErr.response?.status === 404 || firstErr.response?.status === 500) {
        response = await api.post("/api/v1/student/register", payload);
      } else {
        throw firstErr;
      }
    }

    const registeredUser = normalizeUserResponse(response.data || {});

    if (registeredUser.token) {
      localStorage.setItem("scms_token", registeredUser.token);
    }
    setUser(registeredUser);
    localStorage.setItem("scms_user", JSON.stringify(registeredUser));

    return registeredUser;
=======
    return storeAuthSession(response.data);
>>>>>>> 683af069581fb3cd778284919d370fa83ac840f5
  }

  async function updateProfile({ levelOfEducation, nationality, identificationNumber }) {
    const updatedUser = { ...user, levelOfEducation, nationality, identificationNumber };
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