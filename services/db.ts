import { StudentProfile, Submission, Resource, UserRole } from '../types';

// Initial Mock Data
const MOCK_STUDENTS: StudentProfile[] = [
  { username: 'student1', name: 'Alice Smith', role: UserRole.STUDENT, points: 12, badges: [], checkInDate: null },
  { username: 'student2', name: 'Bob Jones', role: UserRole.STUDENT, points: 28, badges: ['speed_gecko'], checkInDate: '2023-11-20' },
  { username: 'student3', name: 'Charlie Day', role: UserRole.STUDENT, points: 42, badges: ['tech_brain'], checkInDate: null },
];

const STORAGE_KEYS = {
  SUBMISSIONS: 'gecko_submissions',
  RESOURCES: 'gecko_resources',
  STUDENTS: 'gecko_students',
  CURRENT_USER: 'gecko_current_user',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify([]));
    }
  }

  // Auth
  async login(username: string): Promise<StudentProfile | { username: string, role: UserRole, name: string } | null> {
    await delay(500);
    if (username === 'admin') {
      return { username: 'admin', role: UserRole.TEACHER, name: 'Mr. Teacher' };
    }
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const student = students.find((s: StudentProfile) => s.username === username);
    return student || null;
  }

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
  }

  async addSubmission(submission: Submission): Promise<void> {
    await delay(500);
    const submissions = await this.getSubmissions();
    submissions.push(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    
    // Auto-award points for homework submission
    await this.updatePoints(submission.studentUsername, 5);
  }

  async updateSubmission(updatedSub: Submission): Promise<void> {
    await delay(300);
    const submissions = await this.getSubmissions();
    const index = submissions.findIndex(s => s.id === updatedSub.id);
    if (index !== -1) {
      submissions[index] = updatedSub;
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESOURCES) || '[]');
  }

  async addResource(resource: Resource): Promise<void> {
    await delay(400);
    const resources = await this.getResources();
    resources.push(resource);
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  }

  // Students & Points
  async getStudents(): Promise<StudentProfile[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  }

  async updatePoints(username: string, delta: number): Promise<void> {
    const students = await this.getStudents();
    const index = students.findIndex(s => s.username === username);
    if (index !== -1) {
      students[index].points = Math.max(0, students[index].points + delta);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }

  async updateCheckIn(username: string, date: string): Promise<void> {
    const students = await this.getStudents();
    const index = students.findIndex(s => s.username === username);
    if (index !== -1) {
      students[index].checkInDate = date;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }
}

export const db = new MockDatabase();
