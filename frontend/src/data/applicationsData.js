// Mock data to match the real `applications` table schema.
// Later it will be replaced with GET /api/students/me/applications

export const MY_APPLICATIONS = [
  {
    id: 142,
    applicationNumber: "APP-2026-0142",
    courseName: "Data Analysis for Evidence-Based Decision Making",
    courseCode: "SC-101",
    intakeName: "September 2026 intake",
    applicationDate: "2026-07-14",
    status: "APPROVED",
    rejectionReason: null,
  },
  {
    id: 198,
    applicationNumber: "APP-2026-0198",
    courseName: "Public Procurement and Contract Management",
    courseCode: "SC-204",
    intakeName: "September 2026 intake",
    applicationDate: "2026-08-02",
    status: "SUBMITTED",
    rejectionReason: null,
  },
  {
    id: 203,
    applicationNumber: "APP-2026-0203",
    courseName: "Monitoring and Evaluation for Development Programmes",
    courseCode: "SC-318",
    intakeName: "October 2026 intake",
    applicationDate: "2026-08-10",
    status: "WAITLISTED",
    rejectionReason: null,
  },
];