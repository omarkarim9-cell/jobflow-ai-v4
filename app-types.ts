// types.ts - COMPLETE (replace entire file)
export interface UserProfile {
  id: string;
  preferences?: any;
  email: string;
  phone: string;
  name?: string;
  location: string;
  summary: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string | null;
  description: string;
  source: string;
  detectedAt: string;
  status: string;  // JobStatus.DETECTED etc.
  matchScore: number;
  requirements: string[] | null;
  notes: string | null;
  logoUrl: string | null;
  applicationUrl: string | null;
  customizedResume: string | null;
  coverLetter: string | null;
  dateApplied: string;
}

export type JobStatus = 'detected' | 'applied' | 'interview' | 'offer' | 'rejected';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
