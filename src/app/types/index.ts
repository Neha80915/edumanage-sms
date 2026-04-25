export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
}

export interface Admin extends User {
  role: 'admin';
  department?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  employeeId: string;
  department: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  joinDate: string;
  photo?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  address: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  admissionDate: string;
  subjects: string[]; // Enrolled subjects
  photo?: string;
  qrCode?: string;
  bloodGroup?: string;
}

export interface Parent extends User {
  role: 'parent';
  children: string[]; // Student IDs
  relation: 'Father' | 'Mother' | 'Guardian';
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  markedBy: string; // Teacher ID
  subject?: string;
  class: string;
  section: string;
  remarks?: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subject: string;
  examType: 'Mid-Term' | 'Final' | 'Unit Test' | 'Assignment' | 'Quiz';
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  date: string;
  teacherId: string; // Teacher who entered the marks
  class: string;
  section: string;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  category: 'Tuition' | 'Transport' | 'Library' | 'Sports' | 'Exam' | 'Other';
  paymentDate?: string;
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  teacherId: string;
  class: string;
  section: string;
  totalMarks: number;
  createdDate: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedDate: string;
  fileUrl?: string;
  marksObtained?: number;
  feedback?: string;
  status: 'Submitted' | 'Pending' | 'Late' | 'Graded';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
  recipientRole?: UserRole;
  recipientId?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  class: string;
  credits: number;
  teacherId: string;
}
