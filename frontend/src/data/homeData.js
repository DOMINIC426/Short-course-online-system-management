// Mock data aligned to the real courses/course_intakes schema.
// Field names match what the backend will actually return.

export const STATS = [
  { value: "12+", label: "Short courses" },
  { value: "3", label: "Study modes" },
  { value: "4", label: "Intakes per year" },
  { value: "100%", label: "Online application" },
];

export const FEATURED_COURSES = [
  {
    id: 1,
    courseCode: "SC-101",
    categoryName: "Data & Analytics",
    name: "Data Analysis for Evidence-Based Decision Making",
    description:
      "Apply Excel, SQL and visual analytics to solve practical problems in governance, business and public service delivery.",
    durationValue: 6,
    durationUnit: "weeks",
    deliveryMode: "Hybrid",
    defaultFee: 350000,
    status: "Published",
  },
  {
    id: 2,
    courseCode: "SC-204",
    categoryName: "Business & Compliance",
    name: "Public Procurement and Contract Management",
    description:
      "Strengthen procurement planning, tender evaluation, compliance and contract administration for public and private institutions.",
    durationValue: 4,
    durationUnit: "weeks",
    deliveryMode: "On campus",
    defaultFee: 280000,
    status: "Published",
  },
  {
    id: 3,
    courseCode: "SC-318",
    categoryName: "Development Studies",
    name: "Monitoring and Evaluation for Development Programmes",
    description:
      "Design indicators, track project performance and prepare donor-ready reports for social and development programmes.",
    durationValue: 8,
    durationUnit: "weeks",
    deliveryMode: "Online",
    defaultFee: 420000,
    status: "Published",
  },
];

export const STEPS = [
  { number: 1, title: "Create an account", text: "Register once with your name, phone and national ID or passport." },
  { number: 2, title: "Submit an application", text: "Pick a course, attach your certificates and CV, then submit." },
  { number: 3, title: "Pay the fee", text: "A control number is issued on approval. Pay by bank or mobile money." },
  { number: 4, title: "Attend and get certified", text: "Follow attendance and results, then download your PDF certificate." },
];