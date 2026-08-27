// Mock data aligned to the real `course` and `course_intakes` schema.
// Later replace with real API calls — component structure stays the same.

export const STATS = [
  { value: "12+", label: "Short courses" },
  { value: "Expert-led", label: "Training" },
  { value: "4", label: "Intakes per year" },
  { value: "100%", label: "Online application" },
];

export const FEATURED_COURSES = [
  {
    id: 1,
    courseCode: "SC-101",
    courseName: "Data Analysis for Evidence-Based Decision Making",
    categoryName: "Data & Analytics",
    description:
      "Apply Excel, SQL and visual analytics to solve practical problems in governance, business and public service delivery.",
    targetAudience: "Government officers, analysts, and early-career professionals.",
    preRequest: "Basic computer literacy.",
    durationValue: 6,
    durationUnit: "weeks",
    trainingHours: 60,
    defaultFee: 350000,
  },
  {
    id: 2,
    courseCode: "SC-204",
    courseName: "Public Procurement and Contract Management",
    categoryName: "Business & Compliance",
    description:
      "Strengthen procurement planning, tender evaluation, compliance and contract administration for public and private institutions.",
    targetAudience: "Procurement officers and compliance staff.",
    preRequest: "None.",
    durationValue: 4,
    durationUnit: "weeks",
    trainingHours: 40,
    defaultFee: 280000,
  },
  {
    id: 3,
    courseCode: "SC-318",
    courseName: "Monitoring and Evaluation for Development Programmes",
    categoryName: "Development Studies",
    description:
      "Design indicators, track project performance and prepare donor-ready reports for social and development programmes.",
    targetAudience: "NGO staff, project officers, development practitioners.",
    preRequest: "None.",
    durationValue: 8,
    durationUnit: "weeks",
    trainingHours: 80,
    defaultFee: 420000,
  },
];

export const COURSE_INTAKES = [
  {
    id: 501,
    courseId: 1,
    intakeCode: "SC101-SEP26",
    name: "September 2026 intake",
    startDate: "2026-09-15",
    endDate: "2026-10-27",
    registrationDeadline: "2026-09-05",
    fee: 350000,
    capacity: 30,
    location: "UDOM Main Campus, Iyumbu",
    status: "OPEN",
  },
  {
    id: 502,
    courseId: 1,
    intakeCode: "SC101-NOV26",
    name: "November 2026 intake",
    startDate: "2026-11-10",
    endDate: "2026-12-19",
    registrationDeadline: "2026-10-31",
    fee: 350000,
    capacity: 40,
    location: "Chimwaga Hall,UDOM Main Campus",
    status: "OPEN",
  },
  {
    id: 503,
    courseId: 2,
    intakeCode: "SC204-SEP26",
    name: "September 2026 intake",
    startDate: "2026-09-20",
    endDate: "2026-10-18",
    registrationDeadline: "2026-09-10",
    fee: 280000,
    capacity: 25,
    location: "UDOM Main Campus, Iyumbu",
    status: "OPEN",
  },
  {
    id: 504,
    courseId: 3,
    intakeCode: "SC318-OCT26",
    name: "October 2026 intake",
    startDate: "2026-10-05",
    endDate: "2026-11-29",
    registrationDeadline: "2026-09-25",
    fee: 420000,
    capacity: 35,
    location: "Conference Hall, UDOM Main Campus",
    status: "CLOSED",
  },
];

export const STEPS = [
  { number: 1, title: "Create an account", text: "Register once with your name, phone and national ID or passport." },
  { number: 2, title: "Submit an application", text: "Pick a course, then submit an application." },
  { number: 3, title: "Pay the fee", text: "A control number is issued on approval. Pay by bank or mobile money." },
  { number: 4, title: "Attend and get certified", text: "Follow attendance, learn and get certified, then download your PDF certificate." },
];