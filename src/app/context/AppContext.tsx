import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Teacher, Parent, Attendance, Mark, Fee, Assignment } from '../types';
import { mockUsers, mockStudents, mockTeachers, mockParents, mockAttendance, mockMarks, mockFees, mockAssignments } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  students: Student[];
  teachers: Teacher[]
  parents: Parent[];
  attendance: Attendance[];
  marks: Mark[];
  fees: Fee[];
  assignments: Assignment[];
  loading: boolean;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  addAttendance: (attendance: Attendance) => Promise<void>;
  addMark: (mark: Mark) => Promise<void>;
  updateFee: (fee: Fee) => void;
  addAssignment: (assignment: Assignment) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Map Supabase row → Student type
const mapStudent = (row: any): Student => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  class: row.class,
  section: row.section,
  rollNumber: row.roll_number,
  gender: row.gender,
  dateOfBirth: row.date_of_birth,
  address: row.address,
  parentId: row.parent_id,
  parentName: row.parent_name,
  parentPhone: row.parent_phone,
  admissionDate: row.admission_date,
  subjects: row.subjects || [],
  bloodGroup: row.blood_group,
});

// Map Supabase row → Attendance type
const mapAttendance = (row: any): Attendance => ({
  id: row.id,
  studentId: row.student_id,
  date: row.date,
  status: row.status,
  markedBy: row.marked_by,
  subject: row.subject,
  class: row.class,
  section: row.section,
  remarks: row.remarks,
});

// Map Supabase row → Mark type
const mapMark = (row: any): Mark => ({
  id: row.id,
  studentId: row.student_id,
  subject: row.subject,
  examType: row.exam_type,
  maxMarks: row.max_marks,
  obtainedMarks: row.obtained_marks,
  grade: row.grade,
  date: row.date,
  teacherId: row.teacher_id,
  class: row.class,
  section: row.section,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('roll_number');
      if (studentsError) throw studentsError;
      if (studentsData) setStudents(studentsData.map(mapStudent));

      // Fetch attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');
      if (attendanceError) throw attendanceError;
      if (attendanceData) setAttendance(attendanceData.map(mapAttendance));

      // Fetch marks
      const { data: marksData, error: marksError } = await supabase
        .from('marks')
        .select('*');
      if (marksError) throw marksError;
      if (marksData) setMarks(marksData.map(mapMark));

    } catch (error) {
      console.error('Supabase fetch error:', error);
      // Fallback to mock data if Supabase fails
      setStudents(mockStudents);
      setAttendance(mockAttendance);
      setMarks(mockMarks);
    } finally {
      setLoading(false);
    }
  };

  const login = (email: string, password: string): boolean => {
    if (password !== 'password') return false;
    const user = mockUsers.find(u => u.email === email);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // STUDENTS — Supabase CRUD
  const addStudent = async (student: Student) => {
    const { error } = await supabase.from('students').insert({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      class: student.class,
      section: student.section,
      roll_number: student.rollNumber,
      gender: student.gender,
      date_of_birth: student.dateOfBirth,
      address: student.address,
      parent_id: student.parentId,
      parent_name: student.parentName,
      parent_phone: student.parentPhone,
      admission_date: student.admissionDate,
      subjects: student.subjects,
      blood_group: student.bloodGroup,
    });
    if (!error) setStudents(prev => [...prev, student]);
    else console.error('Add student error:', error);
  };

  const updateStudent = async (updatedStudent: Student) => {
    const { error } = await supabase.from('students').update({
      name: updatedStudent.name,
      email: updatedStudent.email,
      phone: updatedStudent.phone,
      class: updatedStudent.class,
      section: updatedStudent.section,
      roll_number: updatedStudent.rollNumber,
      gender: updatedStudent.gender,
      date_of_birth: updatedStudent.dateOfBirth,
      address: updatedStudent.address,
      parent_name: updatedStudent.parentName,
      parent_phone: updatedStudent.parentPhone,
      subjects: updatedStudent.subjects,
      blood_group: updatedStudent.bloodGroup,
    }).eq('id', updatedStudent.id);
    if (!error) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    else console.error('Update student error:', error);
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setStudents(prev => prev.filter(s => s.id !== id));
    else console.error('Delete student error:', error);
  };

  // ATTENDANCE — Supabase insert
  const addAttendance = async (newAttendance: Attendance) => {
    const { error } = await supabase.from('attendance').insert({
      id: newAttendance.id,
      student_id: newAttendance.studentId,
      date: newAttendance.date,
      status: newAttendance.status,
      marked_by: newAttendance.markedBy,
      subject: newAttendance.subject,
      class: newAttendance.class,
      section: newAttendance.section,
      remarks: newAttendance.remarks,
    });
    if (!error) setAttendance(prev => [...prev, newAttendance]);
    else console.error('Add attendance error:', error);
  };

  // MARKS — Supabase insert
  const addMark = async (newMark: Mark) => {
    const { error } = await supabase.from('marks').insert({
      id: newMark.id,
      student_id: newMark.studentId,
      subject: newMark.subject,
      exam_type: newMark.examType,
      max_marks: newMark.maxMarks,
      obtained_marks: newMark.obtainedMarks,
      grade: newMark.grade,
      date: newMark.date,
      teacher_id: newMark.teacherId,
      class: newMark.class,
      section: newMark.section,
    });
    if (!error) setMarks(prev => [...prev, newMark]);
    else console.error('Add mark error:', error);
  };

  // These still use local state (can be extended later)
  const addTeacher = (teacher: Teacher) => setTeachers(prev => [...prev, teacher]);
  const updateTeacher = (t: Teacher) => setTeachers(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTeacher = (id: string) => setTeachers(prev => prev.filter(t => t.id !== id));
  const updateFee = (fee: Fee) => setFees(prev => prev.map(f => f.id === fee.id ? fee : f));
  const addAssignment = (a: Assignment) => setAssignments(prev => [...prev, a]);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      students, teachers, parents, attendance, marks, fees, assignments,
      loading,
      addStudent, updateStudent, deleteStudent,
      addTeacher, updateTeacher, deleteTeacher,
      addAttendance, addMark, updateFee, addAssignment,
    }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Loading EduManage...</p>
            <p className="text-white/40 text-sm mt-1">Connecting to database</p>
          </div>
        </div>
      ) : children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
}