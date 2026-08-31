// src/api/backendClient.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
<<<<<<< HEAD
  const token = localStorage.getItem("scms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
=======
  const savedUser = localStorage.getItem("scms_user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

>>>>>>> a4f1965724c3fd04c95910c636ef10f350d16671
  return config;
});

export async function fetchBackendHealth() {
  const response = await api.get('/api/health');
  return response.data.status;
}
