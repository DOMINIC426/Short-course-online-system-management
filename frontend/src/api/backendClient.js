import axios from 'axios';

export const backendClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 3000
});

export async function fetchBackendHealth() {
  const response = await backendClient.get('/api/health');
  return response.data;
}
