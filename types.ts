// types.ts - COMPLETE VERSION
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
  // add other fields as needed
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  // add other fields
}

export interface EmailAccount {
  id: string;
  email: string;
  // add other fields
}
