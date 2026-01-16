// types.ts - FIXED (0 errors)
export enum ViewState {
  DASHBOARD = 'dashboard',
  JOBS = 'jobs',
  SETTINGS = 'settings'
}

export interface UserProfile {
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
}

export interface EmailAccount {
  id: string;
  email: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  dateApplied: string;
  location?: string;        // ADD
  salaryRange?: string;     // ADD  
  requirements?: string[];  // ADD
  notes?: string;           // ADD
  logoUrl?: string;         // ADD
  description?: string;     // ADD
  source?: string;          // ADD
  applicationUrl?: string;  // ADD
  customizedResume?: string;// ADD
  coverLetter?: string;     // ADD
  matchScore?: number;      // ADD
}
export enum JobStatus {
  APPLIED = 'applied',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
  DETECTED = 'detected'     // ADD
}
