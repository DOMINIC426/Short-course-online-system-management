// Mock data for instructor pages. Replace with real API calls once endpoints exist.

export const MY_COURSES = [
  {
    intakeId: 501,
    courseName: "Data Analysis for Evidence-Based Decision Making",
    intakeName: "September 2026 intake",
    venue: "UDOM Main Campus, Iyumbu",
    status: "IN_PROGRESS",
    progressPercent: 40,
    topicsCompleted: "Introduction, Excel Fundamentals",
    remarks: "Students engaging well, on schedule.",
    studentCount: 3,
  },
  {
    intakeId: 502,
    courseName: "Public Procurement and Contract Management",
    intakeName: "September 2026 intake",
    venue: "Room B12",
    status: "NOT_STARTED",
    progressPercent: 0,
    topicsCompleted: "",
    remarks: "",
    studentCount: 1,
  },
];

export const STUDENTS_BY_INTAKE = {
  501: [
    { id: 1, firstName: "Asha", lastName: "Mwakalinga", email: "asha.m@example.com", phone: "0712345001", registeredOn: "2026-08-01", paymentStatus: "PAID", certificateEligibility: "ELIGIBLE" },
    { id: 2, firstName: "Baraka", lastName: "Kileo", email: "baraka.k@example.com", phone: "0712345002", registeredOn: "2026-08-03", paymentStatus: "PARTIALLY_PAID", certificateEligibility: "NOT_ELIGIBLE" },
    { id: 3, firstName: "Catherine", lastName: "Mushi", email: "catherine.m@example.com", phone: "0712345003", registeredOn: "2026-08-05", paymentStatus: "UNPAID", certificateEligibility: "NOT_ELIGIBLE" },
  ],
  502: [
    { id: 4, firstName: "Daniel", lastName: "Ngowi", email: "daniel.n@example.com", phone: "0712345004", registeredOn: "2026-08-02", paymentStatus: "PAID", certificateEligibility: "NOT_ELIGIBLE" },
  ],
};

export const STUDENT_PAYMENT_HISTORY = {
  1: [{ id: 1, date: "2026-08-02", amount: 350000, reference: "TXN-88213" }],
  2: [{ id: 2, date: "2026-08-04", amount: 100000, reference: "TXN-88240" }],
  3: [],
  4: [{ id: 3, date: "2026-08-03", amount: 280000, reference: "TXN-88301" }],
};

export const ANNOUNCEMENTS_HISTORY = [
  {
    id: 1,
    intakeId: 501,
    recipientGroup: "ALL",
    message: "Welcome to Data Analysis! Please bring a laptop to the first session.",
    sentAt: "2026-09-10",
  },
  {
    id: 2,
    intakeId: 501,
    recipientGroup: "UNPAID",
    message: "Reminder: please clear your outstanding balance before the next session.",
    sentAt: "2026-09-18",
  },
];