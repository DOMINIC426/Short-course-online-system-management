import { api } from "./backendClient.js";

// Helper function to safely extract array or object data regardless of backend wrapper structure
const unwrapData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return data ?? [];
};

// ==========================================
// COURSE MANAGEMENT ENDPOINTS
// ==========================================

export async function getCourses() {
  const response = await api.get("/api/v1/market/courses");
  return unwrapData(response.data);
}

export async function getCoursesByStatus(status) {
  const response = await api.get(`/api/v1/market/courses/status/${status}`);
  return unwrapData(response.data);
}

export async function createCourse(course) {
  const response = await api.post("/api/v1/market/courses", course);
  return response.data;
}

export async function updateCourse(id, course) {
  const response = await api.patch(`/api/v1/market/courses/${id}`, course);
  return response.data;
}

export async function deleteCourse(id) {
  const response = await api.delete(`/api/v1/market/courses/${id}`);
  return response.data;
}

export async function setCourseStatus(id, visible) {
  const response = await api.patch(
    `/api/v1/market/courses/${id}/${visible ? "set-visible" : "set-invisible"}`
  );
  return response.data;
}

export async function getCourseStats(courseId) {
  const response = await api.get(`/api/v1/market/courses/${courseId}/stats`);
  return response.data;
}

// ==========================================
// CATEGORY MANAGEMENT ENDPOINTS
// ==========================================

export async function getCategories() {
  const response = await api.get("/api/v1/market/categories");
  return unwrapData(response.data);
}

export async function createCategory(category) {
  const response = await api.post("/api/v1/market/categories", category);
  return response.data;
}

// ==========================================
// INSTRUCTOR MANAGEMENT ENDPOINTS
// ==========================================

export async function getInstructors() {
  const response = await api.get("/api/v1/market/instructors");
  return unwrapData(response.data);
}

export async function createInstructor(instructor) {
  const response = await api.post("/api/v1/market/instructors", instructor);
  return response.data;
}

export async function assignInstructorToCourse(courseId, instructorId) {
  const response = await api.patch(
    `/api/v1/market/courses/${courseId}/assign-instructor/${instructorId}`
  );
  return response.data;
}

export async function removeInstructorFromCourse(courseId, instructorId) {
  const response = await api.delete(
    `/api/v1/market/courses/${courseId}/instructors/${instructorId}`
  );
  return response.data;
}

export async function deleteInstructor(instructorId) {
  const response = await api.delete(`/api/v1/market/instructors/${instructorId}`);
  return response.data;
}