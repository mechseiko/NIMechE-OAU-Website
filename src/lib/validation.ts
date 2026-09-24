import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  matricNumber: z.string().trim().min(3, "Matric number is required to vote").optional().or(z.literal("")),
  level: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  displayName: z.string().min(2, "Enter your full name"),
  phone: z.string().optional().or(z.literal("")),
  matricNumber: z.string().optional().or(z.literal("")),
  level: z.string().optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const newsSchema = z.object({
  title: z.string().min(4, "Title is required"),
  excerpt: z.string().min(10, "Add a short summary"),
  body: z.string().min(20, "Write the article body"),
  category: z.string().min(2, "Category is required"),
  author: z.string().min(2, "Author is required"),
  coverUrl: z.string().optional().or(z.literal("")),
  coverAlt: z.string().optional().or(z.literal("")),
  published: z.boolean(),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const eventSchema = z.object({
  title: z.string().min(4, "Title is required"),
  type: z.enum(["conference", "exhibition", "challenge", "trip", "workshop", "general"]),
  description: z.string().min(10, "Describe the event"),
  location: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  registrationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverUrl: z.string().optional().or(z.literal("")),
  coverAlt: z.string().optional().or(z.literal("")),
  published: z.boolean(),
});
export type EventInput = z.infer<typeof eventSchema>;

export const projectSchema = z.object({
  title: z.string().min(4, "Title is required"),
  summary: z.string().min(10, "Add a one-line summary"),
  description: z.string().min(20, "Describe the project"),
  divisionId: z.string().min(1, "Pick a technical division"),
  status: z.enum(["proposed", "ongoing", "completed"]),
  academicYear: z.string().min(4, "e.g. 2025/2026"),
  coverUrl: z.string().optional().or(z.literal("")),
  coverAlt: z.string().optional().or(z.literal("")),
  published: z.boolean(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const opportunitySchema = z.object({
  title: z.string().min(4, "Title is required"),
  category: z.enum(["siwes", "scholarship", "competition", "job", "training"]),
  organisation: z.string().min(2, "Organisation is required"),
  description: z.string().min(10, "Describe the opportunity"),
  deadline: z.string().optional().or(z.literal("")),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  published: z.boolean(),
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

export const resourceSchema = z.object({
  title: z.string().min(4, "Title is required"),
  category: z.enum([
    "handout",
    "guide",
    "video",
    "constitution",
    "past-question",
    "form",
    "pitch-deck",
  ]),
  description: z.string().optional().or(z.literal("")),
  fileUrl: z.string().optional().or(z.literal("")),
  externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  meta: z.string().optional().or(z.literal("")),
  published: z.boolean(),
});
export type ResourceInput = z.infer<typeof resourceSchema>;

export const executiveSchema = z.object({
  name: z.string().min(2, "Name is required"),
  position: z.string().min(2, "Position is required"),
  administration: z.string().min(4, "e.g. 2025/2026"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
  photoAlt: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0),
  current: z.boolean(),
  message: z.string().optional().or(z.literal("")),
});
export type ExecutiveInput = z.infer<typeof executiveSchema>;

export const divisionSchema = z.object({
  code: z.string().min(2, "Code is required (e.g. THS)"),
  name: z.string().min(3, "Name is required"),
  description: z.string().min(10, "Describe the division"),
  coordinator: z.string().optional().or(z.literal("")),
});
export type DivisionInput = z.infer<typeof divisionSchema>;

export const committeeSchema = z.object({
  name: z.string().min(3, "Name is required"),
  description: z.string().min(10, "Describe the committee"),
  chair: z.string().optional().or(z.literal("")),
});
export type CommitteeInput = z.infer<typeof committeeSchema>;

export const achievementSchema = z.object({
  title: z.string().min(4, "Title is required"),
  description: z.string().min(10, "Describe the achievement"),
  year: z.string().min(4, "Year is required"),
  category: z.enum(["competition", "award", "research", "entrepreneurship"]),
  imageUrl: z.string().optional().or(z.literal("")),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

export const gallerySchema = z.object({
  title: z.string().min(2, "Title is required"),
  imageUrl: z.string().min(4, "Upload or paste an image"),
  alt: z.string().min(4, "Alt text is required for accessibility"),
  category: z.enum(["event", "industry-visit", "project", "department", "achievement"]),
  takenAt: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

export const showcaseSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Describe it"),
  category: z.enum(["facility", "lab", "culture", "programme"]),
  imageUrl: z.string().optional().or(z.literal("")),
});
export type ShowcaseInput = z.infer<typeof showcaseSchema>;

export const alumniSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional().or(z.literal("")),
  matricNumber: z.string().optional().or(z.literal("")),
  graduationYear: z.string().optional().or(z.literal("")),
  currentRole: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
});
export type AlumniInput = z.infer<typeof alumniSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(4, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "alumni", "industry"]),
  website: z.string().max(0, "Spam detected").optional(), // honeypot
});
export type ContactInput = z.infer<typeof contactSchema>;

export const electionSchema = z.object({
  title: z.string().min(4, "Title is required"),
  academicYear: z.string().min(4, "e.g. 2026/2027"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "scheduled", "active", "closed"]),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  requireFeeVerification: z.boolean(),
  liveResults: z.boolean(),
});
export type ElectionInput = z.infer<typeof electionSchema>;

export const positionSchema = z.object({
  title: z.string().min(2, "Position title is required"),
  description: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0),
});
export type PositionInput = z.infer<typeof positionSchema>;

export const candidateSchema = z.object({
  fullName: z.string().min(2, "Candidate name is required"),
  positionId: z.string().min(1, "Pick a position"),
  matricNumber: z.string().optional().or(z.literal("")),
  level: z.string().optional().or(z.literal("")),
  slogan: z.string().optional().or(z.literal("")),
  manifesto: z.string().optional().or(z.literal("")),
  imageUrl: z.string().min(4, "Upload a portrait photo"),
  order: z.coerce.number().int().min(0),
});
export type CandidateInput = z.infer<typeof candidateSchema>;

export const feeSchema = z.object({
  matricNumber: z.string().min(3, "Matric number is required"),
  fullName: z.string().min(2, "Full name is required"),
  academicYear: z.string().min(4, "e.g. 2025/2026"),
  status: z.enum(["paid", "pending", "unpaid"]),
  amount: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
});
export type FeeInput = z.infer<typeof feeSchema>;

export const settingsSchema = z.object({
  siteName: z.string().min(4),
  tagline: z.string().min(4),
  heroTitle: z.string().min(4),
  heroSubtitle: z.string().min(10),
  announcement: z.string().optional().or(z.literal("")),
  announcementActive: z.boolean(),
  aboutMission: z.string().min(10),
  aboutVision: z.string().min(10),
  historyText: z.string().min(10),
  constitutionUrl: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6),
  contactAddress: z.string().min(6),
  currentAdministration: z.string().min(4),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
