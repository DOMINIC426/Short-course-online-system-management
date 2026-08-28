// Mock data matching the real `invoices` table schema.
// Later this will be replaced with GET /api/students/me/invoices

export const MY_INVOICES = [
  {
    id: 1,
    invoiceNumber: "INV-2026-000142",
    courseName: "Data Analysis for Evidence-Based Decision Making",
    intakeName: "September 2026 intake",
    issueDate: "2026-07-16",
    dueDate: "2026-08-30",
    status: "PAID",
    subtotalAmount: 350000,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 350000,
    paidAmount: 350000,
    balanceAmount: 0,
  },
  {
    id: 2,
    invoiceNumber: "INV-2026-000198",
    courseName: "Public Procurement and Contract Management",
    intakeName: "September 2026 intake",
    issueDate: "2026-08-03",
    dueDate: "2026-09-10",
    status: "PARTIALLY_PAID",
    subtotalAmount: 280000,
    discountAmount: 20000,
    taxAmount: 0,
    totalAmount: 260000,
    paidAmount: 100000,
    balanceAmount: 160000,
  },
];