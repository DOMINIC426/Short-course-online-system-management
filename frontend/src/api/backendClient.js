import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Check localStorage for whichever key your Auth context sets on login
  const token =
    localStorage.getItem("scms_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchBackendHealth() {
  const response = await api.get('/api/health');
  return response.data.status;
}