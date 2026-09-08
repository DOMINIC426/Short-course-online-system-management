import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT automatically to authenticated requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("scms_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// If the backend rejects an authenticated request, clear the
// local authentication state and return the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("scms_token");
      localStorage.removeItem("scms_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const backendMessage = responseData?.message || responseData?.error || error?.message;

  if (backendMessage && backendMessage !== "An unexpected error occurred") {
    return backendMessage;
  }

  if (status === 400) return "The request was invalid. Please check your details and try again.";
  if (status === 401) return "Invalid email or password. Please try again.";
  if (status === 403) return "You do not have permission to access this resource.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return backendMessage || "This record already exists.";
  if (status === 500) return "Something went wrong on the server. Please try again later.";

  return fallback;
}

export async function fetchBackendHealth() {
  const response = await api.get("/api/health");
  return response.data.status;
}
