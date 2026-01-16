// types.ts - FIXED (0 errors)
export enum JobStatus {
  APPLIED = 'applied',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected'
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  JOBS = 'jobs',
  SETTINGS = 'settings'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  dateApplied: string;
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
