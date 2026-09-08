// Mock data for student certificate eligibility.
// Later this will be replaced with GET /api/v1/students/me/certificates.

export const MY_CERTIFICATES = [
  {
    id: 1,
    courseName: "Data Analysis for Evidence-Based Decision Making",
    intakeName: "September 2026 intake",
    status: "PENDING",
    reason: "Eligibility will be updated after attendance and assessment results are submitted.",
  },
  {
    id: 2,
    courseName: "Public Procurement and Contract Management",
    intakeName: "September 2026 intake",
    status: "NOT_ELIGIBLE",
    reason: "Complete the remaining course requirements before certificate review.",
  },
];
