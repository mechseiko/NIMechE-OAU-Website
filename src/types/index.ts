export type Role = "super_admin" | "admin" | "editor" | "member";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  matricNumber?: string;
  level?: string;
  phone?: string;
  createdAt: string;
}

export interface Genesis {
  id: "genesis";
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: string;
}

export interface SiteSettings {
  id: "site";
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement?: string;
  announcementActive?: boolean;
  aboutMission: string;
  aboutVision: string;
  values: string[];
  historyText: string;
  constitutionUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socials: { label: string; url: string }[];
  currentAdministration: string;
  stats: { label: string; value: string }[];
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  coverAlt?: string;
  category: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | "conference"
  | "exhibition"
  | "challenge"
  | "trip"
  | "workshop"
  | "general";

export interface Speaker {
  name: string;
  title: string;
  organisation: string;
  topic?: string;
  photoUrl?: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  description: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  registrationUrl?: string;
  coverUrl?: string;
  coverAlt?: string;
  agenda: { time: string; title: string; detail?: string }[];
  speakers: Speaker[];
  pitchDecks: { name: string; url: string }[];
  published: boolean;
  createdAt: string;
}

export type ProjectStatus = "proposed" | "ongoing" | "completed";

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  divisionId: string;
  status: ProjectStatus;
  academicYear: string;
  teamMembers: string[];
  coverUrl?: string;
  coverAlt?: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}

export type OpportunityCategory =
  | "siwes"
  | "scholarship"
  | "competition"
  | "job"
  | "training";

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  organisation: string;
  description: string;
  deadline?: string;
  url?: string;
  location?: string;
  published: boolean;
  createdAt: string;
}

export type ResourceCategory =
  | "handout"
  | "guide"
  | "video"
  | "constitution"
  | "past-question"
  | "form"
  | "pitch-deck";

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  description?: string;
  fileUrl?: string;
  externalUrl?: string;
  meta?: string;
  published: boolean;
  createdAt: string;
}

export interface Executive {
  id: string;
  administration: string;
  position: string;
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  photoAlt?: string;
  order: number;
  current: boolean;
  message?: string;
}

export interface TechnicalDivision {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  focusAreas: string[];
  coordinator?: string;
}

export interface Committee {
  id: string;
  name: string;
  description: string;
  chair?: string;
  focus: string[];
  members: string[];
}

export type AchievementCategory =
  | "competition"
  | "award"
  | "research"
  | "entrepreneurship";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  year: string;
  category: AchievementCategory;
  imageUrl?: string;
  people: string[];
}

export type GalleryCategory =
  | "event"
  | "industry-visit"
  | "project"
  | "department"
  | "achievement";

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  alt: string;
  category: GalleryCategory;
  takenAt?: string;
  description?: string;
}

export type ShowcaseCategory = "facility" | "lab" | "culture" | "programme";

export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  category: ShowcaseCategory;
  imageUrl?: string;
}

export interface AlumniProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  matricNumber?: string;
  graduationYear?: string;
  currentRole?: string;
  company?: string;
  location?: string;
  message?: string;
  createdAt: string;
}

export type ContactType = "general" | "alumni" | "industry";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: ContactType;
  read: boolean;
  createdAt: string;
}

export type ElectionStatus = "draft" | "scheduled" | "active" | "closed";

export interface Election {
  id: string;
  title: string;
  academicYear: string;
  description?: string;
  status: ElectionStatus;
  startsAt?: string;
  endsAt?: string;
  requireFeeVerification: boolean;
  liveResults: boolean;
  publishedResults: boolean;
  createdAt: string;
}

export interface ElectionPosition {
  id: string;
  electionId: string;
  title: string;
  description?: string;
  order: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  positionId: string;
  fullName: string;
  matricNumber?: string;
  level?: string;
  slogan?: string;
  manifesto?: string;
  imageUrl?: string;
  socials: { label: string; url: string }[];
  order: number;
}

export interface Vote {
  id: string; // `${electionId}_${positionId}_${voterUid}` — uniqueness guard
  electionId: string;
  positionId: string;
  candidateId: string;
  voterUid: string;
  votedAt: string;
}

export type FeeStatus = "paid" | "pending" | "unpaid";

export interface FeeRecord {
  id: string; // `${matricNumber}_${academicYear}`
  matricNumber: string;
  fullName: string;
  academicYear: string;
  status: FeeStatus;
  amount?: string;
  note?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  editor: "Editor",
  member: "Member",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  conference: "Conference",
  exhibition: "Exhibition",
  challenge: "Design & Innovation Challenge",
  trip: "Industrial Trip",
  workshop: "Workshop / Training",
  general: "General",
};

export const OPPORTUNITY_LABELS: Record<OpportunityCategory, string> = {
  siwes: "SIWES / Internship",
  scholarship: "Scholarship",
  competition: "Competition",
  job: "Graduate Opening",
  training: "Training",
};

export const RESOURCE_LABELS: Record<ResourceCategory, string> = {
  handout: "Handout",
  guide: "Guide",
  video: "Training Video",
  constitution: "Constitution & Bye-Laws",
  "past-question": "Past Question",
  form: "Form",
  "pitch-deck": "Pitch Deck",
};

export const GALLERY_LABELS: Record<GalleryCategory, string> = {
  event: "Events",
  "industry-visit": "Industry Visits",
  project: "Projects",
  department: "Department",
  achievement: "Achievements",
};

export const ACHIEVEMENT_LABELS: Record<AchievementCategory, string> = {
  competition: "Competition Win",
  award: "Award",
  research: "Research",
  entrepreneurship: "Entrepreneurship",
};

export const SHOWCASE_LABELS: Record<ShowcaseCategory, string> = {
  facility: "Facilities",
  lab: "Laboratories",
  culture: "Culture & Life",
  programme: "Programmes",
};

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  unpaid: "Not Paid",
};

export const ELECTION_STATUS_LABELS: Record<ElectionStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Voting Open",
  closed: "Closed",
};
