import { api } from "./backendClient.js";

export async function getCourses() {
  const response = await api.get("/api/v1/market/courses");
  return response.data;
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
  return api.delete(`/api/v1/market/courses/${id}`);
}

export async function setCourseStatus(id, visible) {
  return api.patch(`/api/v1/market/courses/${id}/${visible ? "set-visible" : "set-invisible"}`);
}

export async function getCategories() {
  const response = await api.get("/api/v1/market/categories");
  return response.data;
}

export async function createCategory(category) {
  const response = await api.post("/api/v1/market/categories", category);
  return response.data;
}

export async function getInstructors() {
  const response = await api.get("/api/v1/market/instructors");
  return response.data;
}

export async function createInstructor(instructor) {
  const response = await api.post("/api/v1/market/instructors", instructor);
  return response.data;
}