export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type JobType = "REMOTE" | "ONSITE" | "HYBRID";

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  jobType: JobType;
  experienceLevel: string;
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}

export interface JobMatch {
  jobId: string;
  jobTitle: string;
  matchScore: number;
  matched: string[];
  missing: string[];
  resumeId: string;
}

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "REJECTED"
  | "HIRED";

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Strong";
}

export interface AIAnalysis {
  id: string;
  resumeId: string;
  score: number;
  level: string;
  skills: Skill[];
  strengths: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  parsedText: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysis | null;
}
