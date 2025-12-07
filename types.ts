export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export interface User {
  username: string;
  role: UserRole;
  name: string;
}

export interface StudentProfile extends User {
  points: number;
  badges: string[];
  checkInDate: string | null; // ISO Date string YYYY-MM-DD
}

export interface Submission {
  id: string;
  studentUsername: string;
  semester: string;
  week: number;
  studyDescription: string;
  helpTopics?: string;
  requestPastPaper: boolean;
  uploadedFile?: string; // Filename mock
  printed: boolean;
  timestamp: number;
  status: 'ontime' | 'late';
}

export interface Resource {
  id: string;
  type: 'worksheet' | 'past_paper';
  title: string;
  filename: string;
  semester: string;
  week: number;
  uploadedBy: string;
  timestamp: number;
}

export interface SemesterOption {
  id: string;
  label: string;
}

export enum GeckoLevel {
  HATCHLING = 'Hatchling',
  CLIMBER = 'Climber',
  STALKER = 'Stalker',
  ALPHA = 'Alpha Gecko'
}

export interface LeaderboardEntry {
  username: string;
  name: string;
  points: number;
  level: GeckoLevel;
}