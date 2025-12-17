
export enum GradeLevel {
  Grade1 = "Grade 1",
  Grade2 = "Grade 2",
  Grade3 = "Grade 3",
  Grade4 = "Grade 4",
  Grade5 = "Grade 5",
  Grade6 = "Grade 6",
  Grade7 = "Grade 7",
  Grade8 = "Grade 8",
  Grade9 = "Grade 9",
  Grade10 = "Grade 10",
  Grade11 = "Grade 11",
  Grade12 = "Grade 12",
  Graduated = "Graduated"
}

// Changed from Enum to string to allow dynamic subjects
export type Subject = string;

export enum PaymentStatus {
  Paid = "Paid",
  Pending = "Pending",
  Overdue = "Overdue",
}

export enum ExpenseCategory {
  Salary = "Salary",
  Maintenance = "Maintenance",
  Utilities = "Utilities",
  Supplies = "Supplies",
  Other = "Other"
}

export enum AttendanceStatus {
  Present = "Present",
  Absent = "Absent",
  Late = "Late"
}

export type Term = "Term 1" | "Term 2" | "Term 3" | "Summer";

export interface Note {
  id: string;
  date: string;
  text: string;
  category: 'Behavior' | 'Medical' | 'Academic' | 'Other';
}

export interface Student {
  id: string;
  fullName: string;
  parentName: string;
  phone: string;
  grade: GradeLevel;
  enrollmentDate: string;
  photo?: string;
  gender: 'Male' | 'Female';
  dob: string;
  address: string;
  medicalInfo?: string;
  libraryClearance?: boolean;
  parentAccessCode?: string;
  notes?: Note[];
}

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  subjects: string[];
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface ExamResult {
  id: string;
  studentId: string;
  subject: Subject;
  score: number;
  maxScore: number;
  date: string;
  term: Term;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  description: string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  date: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface SchoolSettings {
  name: string;
  address: string;
  phone: string;
  theme: 'Ocean' | 'Forest' | 'Sunset' | 'Midnight';
  feeTypes: string[];
  subjects: string[];
  currency: string;
}

export type ViewState = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'grades' | 'settings';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
