// Mock data grounded in FR-ATT-001 to FR-ATT-003.
// Later this will be replaced with GET /api/students/me/attendance

export const MY_ATTENDANCE = [
  {
    intakeId: 501,
    courseName: "Data Analysis for Evidence-Based Decision Making",
    intakeName: "September 2026 intake",
    sessions: [
      { id: 1, date: "2026-09-15", topic: "Introduction to Data Analysis", status: "PRESENT" },
      { id: 2, date: "2026-09-17", topic: "Excel Fundamentals", status: "PRESENT" },
      { id: 3, date: "2026-09-19", topic: "SQL Basics", status: "LATE" },
      { id: 4, date: "2026-09-22", topic: "Data Visualization", status: "ABSENT" },
      { id: 5, date: "2026-09-24", topic: "Descriptive Statistics", status: "EXCUSED" },
      { id: 6, date: "2026-09-26", topic: "Dashboards & Reporting", status: "PRESENT" },
    ],
  },
];