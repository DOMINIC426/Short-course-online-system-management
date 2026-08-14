// src/data/homeData.js
// Mock data for the homepage. Later you replace these with API calls
// (GET /api/courses?featured=true) — the components will not change.

export const STATS = [
  { value: "12+", label: "Short courses" },
  { value: "3", label: "Study modes" },
  { value: "4", label: "Intakes per year" },
  { value: "100%", label: "Online application" },
];

export const FEATURED_COURSES = [
  {
    id: 1,
    code: "SC-101",
    college: "CIVE",
    title: "Data Analysis for Evidence-Based Decision Making",
    summary:
      "Apply Excel, SQL and visual analytics to solve practical problems in governance, business and public service delivery.",
    duration: "6 weeks",
    mode: "Hybrid • Weekday evenings",
    fee: "TZS 350,000",
    seatsLeft: 12,
    tags: ["Data", "Analytics", "Decision Making"],
  },
  {
    id: 2,
    code: "SC-204",
    college: "COBE",
    title: "Public Procurement and Contract Management",
    summary:
      "Strengthen procurement planning, tender evaluation, compliance and contract administration for public and private institutions.",
    duration: "4 weeks",
    mode: "Weekend classes",
    fee: "TZS 280,000",
    seatsLeft: 16,
    tags: ["Procurement", "Compliance", "Public Sector"],
  },
  {
    id: 3,
    code: "SC-318",
    college: "COHU",
    title: "Monitoring and Evaluation for Development Programmes",
    summary:
      "Design indicators, track project performance and prepare donor-ready reports for social and development programmes.",
    duration: "8 weeks",
    mode: "Online • Tutor supported",
    fee: "TZS 420,000",
    seatsLeft: 9,
    tags: ["M&E", "Development", "Research"],
  },
];

export const STEPS = [
  {
    number: 1,
    title: "Create an account",
    text: "Register once with your name, phone and national ID or passport.",
  },
  {
    number: 2,
    title: "Submit an application",
    text: "Pick a course, attach your certificates and CV, then submit.",
  },
  {
    number: 3,
    title: "Pay the fee",
    text: "A control number is issued on approval. Pay by bank or mobile money.",
  },
  {
    number: 4,
    title: "Attend and get certified",
    text: "Follow attendance and results, then download your PDF certificate.",
  },
];
