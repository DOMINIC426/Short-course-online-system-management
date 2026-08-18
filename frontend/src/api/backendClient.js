// src/api/backendClient.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const api = axios.create({
  baseURL,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export async function fetchBackendHealth() {
  const response = await backendClient.get('/api/health');
  return response.data.status;
}
