import axios from "axios";

// Base API URL for instructor endpoints
const BASE_URL = "http://localhost:8081/api/v1/instructor";

/**
 * Builds standard request headers containing the Bearer token stored in localStorage.
 */
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
  /**
   * Fetches the logged-in instructor's profile information.
   * Endpoint: GET /api/v1/instructor/me
   */
  getProfile: async () => {
    const response = await axios.get(`${BASE_URL}/me`, getAuthHeaders());
    return response.data;
  },

  /**
   * Retrieves all courses assigned to the current instructor.
   * Endpoint: GET /api/v1/instructor/courses
   */
  getAssignedCourses: async () => {
    const response = await axios.get(`${BASE_URL}/courses`, getAuthHeaders());
    return response.data;
  },

  /**
   * Retrieves students registered for a specific course, with optional search and filter parameters.
   * Endpoint: GET /api/v1/instructor/courses/{courseId}/students
   */
  getRegisteredStudents: async (courseId, filters = {}) => {
    if (!courseId) return [];
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/students`,
      {
        ...getAuthHeaders(),
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Alias method for retrieving enrolled students to maintain backwards compatibility across components.
   */
  getEnrolledStudents: async (courseId, filters = {}) => {
    return instructorApi.getRegisteredStudents(courseId, filters);
  },

  /**
   * Fetches detailed information for a single student enrollment record.
   * Endpoint: GET /api/v1/instructor/courses/{courseId}/students/{enrollmentId}
   */
  getStudentDetails: async (courseId, enrollmentId) => {
    if (!courseId || !enrollmentId) return null;
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/students/${enrollmentId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Posts a new announcement for students in a specific course.
   * Endpoint: POST /api/v1/instructor/courses/{courseId}/announcements
   * Payload structure: { title, message, audienceType, selectedStudentIds, expiryDate }
   */
  sendAnnouncement: async (courseId, announcementData) => {
    if (!courseId) throw new Error("Course ID is required.");
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/announcements`,
      announcementData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Submits a venue update request for a course.
   * Endpoint: PUT /api/v1/instructor/courses/{courseId}/venue
   * Payload structure: { venueId, reason }
   */
  updateVenue: async (courseId, venueId, reason) => {
    if (!courseId) throw new Error("Course ID is required.");
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/venue`,
      { venueId, reason },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Records or updates teaching progress for a specific course.
   * Endpoint: POST /api/v1/instructor/courses/{courseId}/progress
   * Expected payload structure:
   * {
   *   progressPercentage: number,
   *   topicsCompleted: string,
   *   topicsRemaining: string,
   *   challenges: string,
   *   remarks: string,
   *   expectedCompletionDate: string (YYYY-MM-DD)
   * }
   */
  updateCourseProgress: async (courseId, progressData) => {
    if (!courseId) throw new Error("Course ID is required to record progress.");
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/progress`,
      progressData,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Marks an entire course as officially completed.
   * Endpoint: PUT /api/v1/instructor/courses/{courseId}/complete
   */
  markCourseCompleted: async (courseId) => {
    if (!courseId) throw new Error("Course ID is required.");
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/complete`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Updates student certificate eligibility status for a course enrollment.
   * Endpoint: PUT /api/v1/instructor/courses/{courseId}/students/{enrollmentId}/certificate-eligibility
   * Payload structure: { status: "ELIGIBLE" | "NOT_ELIGIBLE", reason }
   */
  updateCertificateEligibility: async (courseId, enrollmentId, status, reason) => {
    if (!courseId || !enrollmentId) {
      throw new Error("Both Course ID and Enrollment ID are required.");
    }
    const response = await axios.put(
      `${BASE_URL}/courses/${courseId}/students/${enrollmentId}/certificate-eligibility`,
      { status, reason },
      getAuthHeaders()
    );
    return response.data;
  },
};