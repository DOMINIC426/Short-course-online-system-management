import { initialInstructorCourses, initialStudents, initialAnnouncements } from "../data/instructorData";

// Simulated API calls that return Promises
export const instructorApi = {
  getAssignedCourses: async () => {
    return Promise.resolve([...initialInstructorCourses]);
  },

  getRegisteredStudents: async (courseId) => {
    if (courseId) {
      return Promise.resolve(initialStudents.filter((s) => s.courseId === courseId));
    }
    return Promise.resolve([...initialStudents]);
  },

  updateVenue: async (courseId, newVenue, reason) => {
    const course = initialInstructorCourses.find((c) => c.id === courseId);
    if (course) {
      course.venue = newVenue;
    }
    return Promise.resolve({ success: true, courseId, newVenue, reason });
  },

  updateCourseProgress: async (courseId, { progressPercent, completedTopics, remarks }) => {
    const course = initialInstructorCourses.find((c) => c.id === courseId);
    if (course) {
      course.progressPercent = progressPercent;
      course.completedTopics = completedTopics;
      course.remarks = remarks;
    }
    return Promise.resolve({ success: true, course });
  },

  markCourseCompleted: async (courseId) => {
    const course = initialInstructorCourses.find((c) => c.id === courseId);
    if (course) {
      course.status = "COMPLETED";
      course.progressPercent = 100;
    }
    return Promise.resolve({ success: true, course });
  },

  sendAnnouncement: async ({ courseId, title, content, targetAudience }) => {
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      courseId,
      title,
      content,
      targetAudience,
      dateSent: new Date().toISOString().split("T")[0],
    };
    initialAnnouncements.unshift(newAnnouncement);
    return Promise.resolve({ success: true, announcement: newAnnouncement });
  },

  updateCertificateEligibility: async (studentId, eligibilityStatus) => {
    const student = initialStudents.find((s) => s.id === studentId);
    if (student) {
      student.certificateEligibility = eligibilityStatus;
    }
    return Promise.resolve({ success: true, studentId, eligibilityStatus });
  },
};