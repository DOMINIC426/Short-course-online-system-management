// Mock data for student course announcements.
// Later this will be replaced with GET /api/v1/students/me/announcements.

export const STUDENT_ANNOUNCEMENTS = [
  {
    id: 1,
    courseName: "Data Analysis for Evidence-Based Decision Making",
    title: "Next session venue update",
    message: "The next in-person session will be held at Chimwaga Hall, UDOM Main Campus.",
    createdBy: "Course instructor",
    createdDate: "2026-08-24T09:00:00",
    isRead: false,
  },
  {
    id: 2,
    courseName: "Public Procurement and Contract Management",
    title: "Course materials available",
    message: "The reading list and preparation notes for the next session are now available.",
    createdBy: "Course instructor",
    createdDate: "2026-08-20T14:30:00",
    isRead: true,
  },
];
