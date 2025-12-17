import { Student, AttendanceRecord, FeeRecord, GradeLevel, PaymentStatus, ExpenseRecord, ExpenseCategory, ExamResult, Subject, ActivityLog, SchoolSettings, AttendanceStatus, Term, Teacher } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'cim_students',
  ATTENDANCE: 'cim_attendance',
  FEES: 'cim_fees',
  EXPENSES: 'cim_expenses',
  GRADES: 'cim_grades',
  ACTIVITIES: 'cim_activities',
  ANNOUNCEMENT: 'cim_announcement',
  SETTINGS: 'cim_settings',
  TEACHERS: 'cim_teachers'
};

// Seed Data
const initialStudents: Student[] = [
  { id: '1', fullName: 'Ahmed Nur', parentName: 'Fatima Ali', phone: '615-555-0101', grade: GradeLevel.Grade5, enrollmentDate: '2023-09-01', gender: 'Male', dob: '2012-05-15', address: 'Mogadishu, Hodan', parentAccessCode: 'AHM-101', libraryClearance: true },
  { id: '2', fullName: 'Khadija Omar', parentName: 'Omar Yusuf', phone: '615-555-0102', grade: GradeLevel.Grade3, enrollmentDate: '2023-09-02', gender: 'Female', dob: '2014-08-20', address: 'Mogadishu, Waberi', parentAccessCode: 'KHA-102', libraryClearance: true },
  { id: '3', fullName: 'Liban Farah', parentName: 'Amina Hassan', phone: '615-555-0103', grade: GradeLevel.Grade8, enrollmentDate: '2023-09-01', gender: 'Male', dob: '2009-03-10', address: 'Mogadishu, Heliwa', parentAccessCode: 'LIB-103', libraryClearance: false },
  { id: '4', fullName: 'Safia Abdi', parentName: 'Abdi Mohamed', phone: '615-555-0104', grade: GradeLevel.Grade1, enrollmentDate: '2024-01-15', gender: 'Female', dob: '2016-11-05', address: 'Mogadishu, Hamar Weyne', parentAccessCode: 'SAF-104', libraryClearance: true },
  { id: '5', fullName: 'Yusuf Ibrahim', parentName: 'Hodan Warsame', phone: '615-555-0105', grade: GradeLevel.Grade5, enrollmentDate: '2023-09-01', gender: 'Male', dob: '2012-01-25', address: 'Mogadishu, Hodan', parentAccessCode: 'YUS-105', libraryClearance: true },
];

const initialTeachers: Teacher[] = [
    { id: 't1', fullName: 'Ustad Hassan', phone: '615-000-001', subjects: ['Math', 'Physics'], joinDate: '2020-01-01' },
    { id: 't2', fullName: 'Ustadah Maryam', phone: '615-000-002', subjects: ['Somali', 'Tarbiyo'], joinDate: '2021-05-15' }
];

const initialFees: FeeRecord[] = [
  { id: '101', studentId: '1', amount: 50, date: '2024-05-01', status: PaymentStatus.Paid, description: 'Tuition Fee' },
  { id: '102', studentId: '2', amount: 45, date: '2024-05-01', status: PaymentStatus.Pending, description: 'Tuition Fee' },
  { id: '103', studentId: '3', amount: 60, date: '2024-04-01', status: PaymentStatus.Overdue, description: 'Transport Fee' },
];

const initialExpenses: ExpenseRecord[] = [
  { id: 'e1', description: 'Teacher Salaries (May)', category: ExpenseCategory.Salary, amount: 1200, date: '2024-05-01' },
  { id: 'e2', description: 'School Cleaning Supplies', category: ExpenseCategory.Supplies, amount: 150, date: '2024-05-05' },
];

const initialAttendance: AttendanceRecord[] = [
    { id: 'a1', studentId: '1', date: new Date().toISOString().split('T')[0], status: AttendanceStatus.Present },
    { id: 'a2', studentId: '2', date: new Date().toISOString().split('T')[0], status: AttendanceStatus.Absent },
    { id: 'a3', studentId: '3', date: new Date().toISOString().split('T')[0], status: AttendanceStatus.Late },
];

const initialGrades: ExamResult[] = [
  { id: 'g1', studentId: '1', subject: 'Math', score: 85, maxScore: 100, date: '2024-04-15', term: 'Term 1' },
  { id: 'g2', studentId: '1', subject: 'Somali', score: 92, maxScore: 100, date: '2024-04-15', term: 'Term 1' },
  { id: 'g3', studentId: '5', subject: 'Math', score: 78, maxScore: 100, date: '2024-04-15', term: 'Term 1' },
];

const initialActivities: ActivityLog[] = [
  { id: 'act1', action: 'System Initialized', details: 'Welcome to Cabdullahi SMS', date: new Date().toISOString(), timestamp: Date.now(), type: 'info' }
];

const initialSettings: SchoolSettings = {
  name: "Cabdullahi ibnu Mubarak",
  address: "Mogadishu, Somalia",
  phone: "+252 61 5000000",
  theme: "Ocean",
  feeTypes: ["Tuition Fee", "Registration Fee", "Exam Fee", "Transport Fee", "Books/Uniform"],
  subjects: ["Math", "Physics", "Biology", "Chemistry", "Somali", "Carabi", "English", "Tarbiyo", "Taarikh", "Juqraafi", "Business", "Technology"],
  currency: "USD"
};

const initialAnnouncement = "Welcome to the new term! Please ensure all student records are updated by Friday.";

// Helper to load/save
const loadData = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const saveData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Exports
export const DataService = {
  getStudents: (): Student[] => loadData(STORAGE_KEYS.STUDENTS, initialStudents),
  saveStudents: (data: Student[]) => saveData(STORAGE_KEYS.STUDENTS, data),

  getTeachers: (): Teacher[] => loadData(STORAGE_KEYS.TEACHERS, initialTeachers),
  saveTeachers: (data: Teacher[]) => saveData(STORAGE_KEYS.TEACHERS, data),

  getFees: (): FeeRecord[] => loadData(STORAGE_KEYS.FEES, initialFees),
  saveFees: (data: FeeRecord[]) => saveData(STORAGE_KEYS.FEES, data),

  getExpenses: (): ExpenseRecord[] => loadData(STORAGE_KEYS.EXPENSES, initialExpenses),
  saveExpenses: (data: ExpenseRecord[]) => saveData(STORAGE_KEYS.EXPENSES, data),

  getAttendance: (): AttendanceRecord[] => loadData(STORAGE_KEYS.ATTENDANCE, initialAttendance),
  saveAttendance: (data: AttendanceRecord[]) => saveData(STORAGE_KEYS.ATTENDANCE, data),

  getGrades: (): ExamResult[] => loadData(STORAGE_KEYS.GRADES, initialGrades),
  saveGrades: (data: ExamResult[]) => saveData(STORAGE_KEYS.GRADES, data),

  getActivities: (): ActivityLog[] => loadData(STORAGE_KEYS.ACTIVITIES, initialActivities),
  
  getSettings: (): SchoolSettings => loadData(STORAGE_KEYS.SETTINGS, initialSettings),
  saveSettings: (data: SchoolSettings) => saveData(STORAGE_KEYS.SETTINGS, data),

  logActivity: (action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const activities = loadData(STORAGE_KEYS.ACTIVITIES, initialActivities);
    const newActivity: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      type
    };
    const updated = [newActivity, ...activities].slice(0, 50);
    saveData(STORAGE_KEYS.ACTIVITIES, updated);
    return updated;
  },

  getAnnouncement: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT) || initialAnnouncement;
  },
  saveAnnouncement: (text: string) => localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, text),
  
  clearAllData: () => {
    localStorage.clear();
  },

  getAllData: () => {
    return {
      students: loadData(STORAGE_KEYS.STUDENTS, initialStudents),
      teachers: loadData(STORAGE_KEYS.TEACHERS, initialTeachers),
      fees: loadData(STORAGE_KEYS.FEES, initialFees),
      expenses: loadData(STORAGE_KEYS.EXPENSES, initialExpenses),
      attendance: loadData(STORAGE_KEYS.ATTENDANCE, initialAttendance),
      grades: loadData(STORAGE_KEYS.GRADES, initialGrades),
      activities: loadData(STORAGE_KEYS.ACTIVITIES, initialActivities),
      settings: loadData(STORAGE_KEYS.SETTINGS, initialSettings),
      announcement: localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT) || initialAnnouncement,
      timestamp: new Date().toISOString(),
      appVersion: '1.4'
    };
  },

  restoreData: (jsonData: any) => {
    try {
      if (jsonData.students) saveData(STORAGE_KEYS.STUDENTS, jsonData.students);
      if (jsonData.teachers) saveData(STORAGE_KEYS.TEACHERS, jsonData.teachers);
      if (jsonData.fees) saveData(STORAGE_KEYS.FEES, jsonData.fees);
      if (jsonData.expenses) saveData(STORAGE_KEYS.EXPENSES, jsonData.expenses);
      if (jsonData.attendance) saveData(STORAGE_KEYS.ATTENDANCE, jsonData.attendance);
      if (jsonData.grades) saveData(STORAGE_KEYS.GRADES, jsonData.grades);
      if (jsonData.activities) saveData(STORAGE_KEYS.ACTIVITIES, jsonData.activities);
      if (jsonData.settings) saveData(STORAGE_KEYS.SETTINGS, jsonData.settings);
      if (jsonData.announcement) localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT, jsonData.announcement);
      return true;
    } catch (e) {
      console.error("Failed to restore data", e);
      return false;
    }
  },

  // Helper: Promote Students
  promoteStudents: (fromGrade: GradeLevel, toGrade: GradeLevel) => {
      const students = loadData(STORAGE_KEYS.STUDENTS, initialStudents);
      const updated = students.map(s => {
          if (s.grade === fromGrade) {
              return { ...s, grade: toGrade };
          }
          return s;
      });
      saveData(STORAGE_KEYS.STUDENTS, updated);
      return updated;
  },

  // Helper: CSV Import
  parseStudentCSV: (csvText: string): Student[] => {
    const lines = csvText.split('\n');
    const students: Student[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 4) {
            students.push({
                id: Math.random().toString(36).substr(2, 9),
                fullName: parts[0]?.trim() || 'Unknown',
                parentName: parts[1]?.trim() || 'Unknown',
                phone: parts[2]?.trim() || '',
                grade: (parts[3]?.trim() as GradeLevel) || GradeLevel.Grade1,
                gender: (parts[4]?.trim() as 'Male' | 'Female') || 'Male',
                address: parts[5]?.trim() || 'Mogadishu',
                dob: '2015-01-01', 
                enrollmentDate: new Date().toISOString().split('T')[0],
                parentAccessCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
                libraryClearance: true
            });
        }
    }
    return students;
  }
};