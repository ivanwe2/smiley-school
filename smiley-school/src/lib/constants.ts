// ─── School Info ────────────────────────────────────────────────────────────
export const SCHOOL = {
  name: "Smiley School",
  tagline: "Cambridge-Certified English Language Center",
  address: "123 Learning Street, Athens, 10431",
  phone: "+30 210 123 4567",
  email: "info@smileyschool.com",
  hours: "Mon–Fri: 9:00–21:00 | Sat: 10:00–14:00",
  founded: 2005,
  yearsExperience: new Date().getFullYear() - 2005,
  studentsCertified: 1200,
  passRate: 97,
  social: {
    facebook: "https://facebook.com/smileyschool",
    instagram: "https://instagram.com/smileyschool",
  },
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144!2d23.7275!3d37.9838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSmiley+School!5e0!3m2!1sen!2sgr!4v1234567890",
} as const;

// ─── Navigation ─────────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "courses", href: "/courses" },
  { key: "schedule", href: "/schedule" },
  { key: "news", href: "/news" },
  { key: "gallery", href: "/gallery" },
  { key: "contact", href: "/contact" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Schedule", href: "/admin/schedule", icon: "CalendarDays" },
  { label: "Posts", href: "/admin/posts", icon: "FileText" },
  { label: "Gallery", href: "/admin/gallery", icon: "Images" },
  { label: "Contacts", href: "/admin/contacts", icon: "Mail" },
] as const;

// ─── Cambridge Exam Levels ───────────────────────────────────────────────────
export const CAMBRIDGE_LEVELS = [
  {
    code: "A2",
    name: "A2 Key (KET)",
    description: "Ideal for beginners building their first English foundation.",
    color: "#059669",
  },
  {
    code: "B1",
    name: "B1 Preliminary (PET)",
    description: "For students developing everyday communication skills.",
    color: "#D97706",
  },
  {
    code: "B2",
    name: "B2 First (FCE)",
    description:
      "The most popular exam — proof of upper-intermediate English ability.",
    color: "#1E3A5F",
  },
  {
    code: "C1",
    name: "C1 Advanced (CAE)",
    description: "For high achievers targeting university and career success.",
    color: "#0F1F3D",
  },
] as const;

// ─── Inquiry Types (for contact form) ───────────────────────────────────────
export const INQUIRY_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General Inquiry",
  ENROLLMENT: "Enrollment",
  SCHEDULE: "Schedule Question",
  CAMBRIDGE_EXAM: "Cambridge Exam Info",
  PRICING: "Pricing & Fees",
};

// ─── Post Categories ────────────────────────────────────────────────────────
export const POST_CATEGORY_LABELS: Record<string, string> = {
  NEWS: "News",
  EVENTS: "Events",
  GRADUATIONS: "Graduations",
  ANNOUNCEMENTS: "Announcements",
};