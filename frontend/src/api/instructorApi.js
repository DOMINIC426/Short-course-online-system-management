import axios from "axios";

const BASE_URL = "http://localhost:8081/api/v1/instructor";

// Helper to retrieve auth headers with bearer token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

export const instructorApi = {
  // 1. Get Instructor Profile
  // Endpoint: GET /api/v1/instructor/me
  getProfile: async () => {
    const response = await axios.get(`${BASE_URL}/me`, getAuthHeaders());
    return response.data;
  },

  // 2. Get Instructor Courses
  // Endpoint: GET /api/v1/instructor/courses
  getAssignedCourses: async () => {
    const response = await axios.get(`${BASE_URL}/courses`, getAuthHeaders());
    return response.data;
  },

  // 3 & 4. Get / Search / Filter Registered Students
  // Endpoint: GET /api/v1/instructor/courses/{courseId}/students
  getRegisteredStudents: async (courseId, filters = {}) => {
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/students`,
      {
        ...getAuthHeaders(),
        params: filters, // Pass search/filter query params (e.g. status, keyword)
      }
    );
    return response.data;
  },

  // 5. Get Student Details
  // Endpoint: GET /api/v1/instructor/courses/{courseId}/students/{enrollmentId}
  getStudentDetails: async (courseId, enrollmentId) => {
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/students/${enrollmentId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // 6. Create Announcement
  // Endpoint: POST /api/v1/instructor/courses/{courseId}/announcements
  sendAnnouncement: async (courseId, announcementData) => {
    // Expected body: { title, message, audienceType, selectedStudentIds, expiryDate }
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/announcements`,
      announcementData,
      getAuthHeaders()
    );
    return response.data;
  },

  // 7. Change Course Venue
  // Endpoint: PUT /api/v1/instructor/courses/{courseId}/venue
  updateVenue: async (courseId, venueId, reason) => {
    // Expected body: { venueId, reason }
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/venue`,
      { venueId, reason },
      getAuthHeaders()
    );
    return response.data;
  },

  // 8. Update Course Progress
  // Endpoint: POST /api/v1/instructor/courses/{courseId}/progress
  updateCourseProgress: async (courseId, progressData) => {
    // Expected body: { progressPercentage, topicsCompleted, topicsRemaining, challenges, remarks, expectedCompletionDate }
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/progress`,
      progressData,
      getAuthHeaders()
    );
    return response.data;
  },

  // 9. Mark Course as Completed
  // Endpoint: PUT /api/v1/instructor/courses/{courseId}/complete
  markCourseCompleted: async (courseId) => {
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/complete`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // 10. Update Certificate Eligibility
  // Endpoint: PUT /api/v1/instructor/courses/{courseId}/students/{enrollmentId}/certificate-eligibility
  updateCertificateEligibility: async (courseId, enrollmentId, status, reason) => {
    // Expected body: { status: "ELIGIBLE" | "NOT_ELIGIBLE", reason }
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/students/${enrollmentId}/certificate-eligibility`,
      { status, reason },
      getAuthHeaders()
    );
    return response.data;
  },
};