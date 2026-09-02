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

export async function fetchBackendHealth() {
  const response = await api.get("/api/health");
  return response.data.status;
}
