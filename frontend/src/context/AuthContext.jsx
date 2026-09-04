import { createContext, useContext, useState, useEffect } from "react";
import { api, getApiErrorMessage } from "../api/backendClient.js";

/**
 * Global Authentication Context
 * Manages user state, persistence in LocalStorage, and auth-related network operations.
 */
const AuthContext = createContext(null);

/**
 * Helper: Safely reads and parses cached user session from LocalStorage.
 * Handles corrupted JSON gracefully by resetting storage if parsing fails.
 * 
 * @returns {Object|null} Cached user object or null if unauthenticated.
 */
function getStoredUser() {
  try {
    const saved = localStorage.getItem("scms_user");
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error("DEBUG: Failed to parse scms_user from localStorage:", err);
    localStorage.removeItem("scms_user");
    return null;
  }
}

/**
 * Helper: Normalizes profile field keys returned from heterogeneous backend endpoints.
 * Backend responses may use camelCase or snake_case depending on the API layer version.
 * 
 * @param {Object} data Raw profile payload from server API
 * @returns {Object} Standardized profile fields
 */
function normalizeProfileFields(data) {
  if (!data) return {};
  return {
    levelOfEducation:
      data.levelOfEducation ??
      data.level_of_education ??
      "",
    nationality: data.nationality ?? "",
    identificationNumber:
      data.identificationNumber ??
      data.identification_number ??
      "",
  };
}

/**
 * Helper: Unifies user payloads across login, registration, and profile endpoints.
 * 
 * @param {Object} data Raw server response object
 * @returns {Object} Normalized user representation ready for frontend state/storage
 */
function normalizeUserResponse(data) {
  if (!data) return null;

  // Extract JWT token from possible backend keys
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
  // Initialize user state synchronously from local storage cache
  const [user, setUser] = useState(() => getStoredUser());

  /**
   * Helper: Writes active session tokens and user meta to LocalStorage & React state.
   * Duplicate keys ('scms_token', 'token', 'jwt') are maintained to preserve compatibility
   * across legacy API interceptors.
   * 
   * @param {Object} userData Payload containing user info and bearer JWT
   * @returns {Object} Saved user object (excluding sensitive token strings)
   */
  function storeAuthSession(userData) {
    const normalizedUser = normalizeUserResponse(userData);

    if (normalizedUser.token) {
      localStorage.setItem("scms_token", normalizedUser.token);
      localStorage.setItem("token", normalizedUser.token);
      localStorage.setItem("jwt", normalizedUser.token);
    }

    // Exclude token from the user profile state stored in LocalStorage
    const { token, ...storedUser } = normalizedUser;

    localStorage.setItem("scms_user", JSON.stringify(storedUser));
    setUser(storedUser);

    return storedUser;
  }

  /**
   * Syncs latest user profile state from API.
   * Only student roles have permission to fetch `/api/v1/student/profile`.
   * 
   * @param {Object} targetUser Optional target user to evaluate
   */
  async function fetchUserProfile(targetUser = user) {
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
      // Non-blocking error: keep active local session state intact
      console.warn(
        "DEBUG: Profile background refresh bypassed:",
        getApiErrorMessage(error)
      );
      return targetUser;
    }
  }

  /**
   * Authenticates user against backend and saves resulting session.
   * Automatically triggers fresh profile fetching to pull complete student metadata.
   * 
   * @param {string} email 
   * @param {string} password 
   */
  async function login(email, password) {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
    });

    const storedSession = storeAuthSession(response.data);

    // If user is a student, fetch fresh profile immediately upon login
    if (storedSession.role === "STUDENT") {
      return await fetchUserProfile(storedSession);
    }

    return storedSession;
  }

  /**
   * Registers a new student account and automatically initializes 
   * the backend student profile record.
   */
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

    // 1. Submit auth registration request
    const response = await api.post("/api/v1/auth/register", payload);

    // 2. Establish active session
    let sessionUser = null;
    if (response.data?.token) {
      sessionUser = storeAuthSession(response.data);
      if (sessionUser.role === "STUDENT") {
        sessionUser = await fetchUserProfile(sessionUser);
      }
    } else {
      // Fallback: If backend register endpoint doesn't return JWT token, auto-login
      sessionUser = await login(email, password);
    }

    return sessionUser;
  }

  /**
   * Updates profile metadata via API, local React state, and LocalStorage.
   * 
   * @param {Object} profileParams Updated profile properties
   */
  async function updateProfile({ levelOfEducation, nationality, identificationNumber }) {
    const payload = {
      levelOfEducation,
      nationality,
      identificationNumber,
    };

    // 1. Send update to Spring Boot backend endpoint
    await api.put("/api/v1/student/profile", payload);

    // 2. Sync React state and local storage with updated fields directly
    const updatedUser = {
      ...user,
      ...payload,
    };

    setUser(updatedUser);
    localStorage.setItem("scms_user", JSON.stringify(updatedUser));

    // 3. Perform a fresh pull from backend to ensure state consistency
    return await fetchUserProfile(updatedUser);
  }

  /**
   * Initiates password recovery flow.
   * @param {string} identifier User email or account identifier
   */
  async function forgotPassword(identifier) {
    const response = await api.post("/api/v1/auth/forgot-password", {
      identifier,
    });
    return response.data;
  }

  /**
   * Completes password reset given an authorization token and new password.
   */
  async function resetPassword(token, newPassword) {
    const response = await api.post("/api/v1/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  }

  /**
   * Clears active authentication session and purges storage tokens.
   */
  function logout() {
    setUser(null);
    localStorage.removeItem("scms_token");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("scms_user");
  }

  /**
   * On component mount, attempt to refresh user profile data if a valid JWT exists.
   */
  useEffect(() => {
    const token = localStorage.getItem("scms_token") || localStorage.getItem("token");
    if (user?.role === "STUDENT" && token) {
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

/**
 * Custom Hook: Access active AuthContext state and methods.
 * @throws Will throw if invoked outside of an AuthProvider tree.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider component.");
  }
  return context;
}