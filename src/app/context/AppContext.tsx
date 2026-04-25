import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Teacher, Parent, Attendance, Mark, Fee, Assignment } from '../types';
import { mockAssignments } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  attendance: Attendance[];
  marks: Mark[];
  fees: Fee[];
  assignments: Assignment[];
  loading: boolean;
  addStudent: (student: Student, password: string) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (teacher: Teacher, password: string) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addAttendance: (attendance: Attendance) => Promise<void>;
  addMark: (mark: Mark) => Promise<void>;
  updateFee: (fee: Fee) => void;
  addAssignment: (assignment: Assignment) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapStudent = (row: any): Student => ({
  id: row.id, name: row.name, email: row.email, phone: row.phone,
  class: row.class, section: row.section, rollNumber: row.roll_number,
  gender: row.gender, dateOfBirth: row.date_of_birth, address: row.address,
  parentId: row.parent_id, parentName: row.parent_name, parentPhone: row.parent_phone,
  admissionDate: row.admission_date, subjects: row.subjects || [], bloodGroup: row.blood_group,
});

const mapAttendance = (row: any): Attendance => ({
  id: row.id, studentId: row.student_id, date: row.date, status: row.status,
  markedBy: row.marked_by, subject: row.subject, class: row.class,
  section: row.section, remarks: row.remarks,
});

const mapMark = (row: any): Mark => ({
  id: row.id, studentId: row.student_id, subject: row.subject,
  examType: row.exam_type, maxMarks: row.max_marks, obtainedMarks: row.obtained_marks,
  grade: row.grade, date: row.date, teacherId: row.teacher_id,
  class: row.class, section: row.section,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Profile fetch error:', error);
      setLoading(false);
      return;
    }

    setCurrentUser({
      id: data.related_id || userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    });

    // Fetch all data immediately after profile
    await fetchAllData();
    setLoading(false);
  };

  const fetchAllData = async () => {
    try {
      const { data: studentsData } = await supabase.from('students').select('*').order('roll_number');
      if (studentsData) setStudents(studentsData.map(mapStudent));

      const { data: attendanceData } = await supabase.from('attendance').select('*');
      if (attendanceData) setAttendance(attendanceData.map(mapAttendance));

      const { data: marksData } = await supabase.from('marks').select('*');
      if (marksData) setMarks(marksData.map(mapMark));

      const { data: teachersData } = await supabase.from('teachers').select('*');
      if (teachersData) {
        setTeachers(teachersData.map((t: any) => ({
          id: t.id, name: t.name, email: t.email, phone: t.phone,
          role: 'teacher' as const, employeeId: t.employee_id,
          department: t.department, subjects: t.subjects || [],
          classes: t.classes || [], qualification: t.qualification,
          joinDate: t.join_date,
        })));
      }

      const { data: parentsData } = await supabase.from('parents').select('*');
      if (parentsData) {
        setParents(parentsData.map((p: any) => ({
          id: p.id, name: p.name, email: p.email, phone: p.phone,
          role: 'parent' as const, relation: p.relation, children: p.children || [],
        })));
      }

      const { data: feesData } = await supabase.from('fees').select('*');
      if (feesData) {
        setFees(feesData.map((f: any) => ({
          id: f.id, studentId: f.student_id, amount: f.amount,
          paidAmount: f.paid_amount, dueDate: f.due_date,
          status: f.status, category: f.category, paymentDate: f.payment_date,
        })));
      }

    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStudents([]);
    setAttendance([]);
    setMarks([]);
  };

  // ADD STUDENT — creates auth account + profile + student record
  const addStudent = async (student: Student, password: string) => {
    // 1. Create auth user using regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: student.email,
      password: password,
    });
    if (authError) { console.error('Auth create error:', authError); return; }

    const authUserId = authData.user?.id;
    if (!authUserId) return;

    // 2. Create profile
    await supabase.from('profiles').insert({
      id: authUserId,
      email: student.email,
      name: student.name,
      phone: student.phone,
      role: 'student',
      related_id: student.id,
    });

    // 3. Insert student record
    const { error } = await supabase.from('students').insert({
      id: student.id, name: student.name, email: student.email, phone: student.phone,
      class: student.class, section: student.section, roll_number: student.rollNumber,
      gender: student.gender, date_of_birth: student.dateOfBirth, address: student.address,
      parent_id: student.parentId, parent_name: student.parentName,
      parent_phone: student.parentPhone, admission_date: student.admissionDate,
      subjects: student.subjects, blood_group: student.bloodGroup,
    });
    if (!error) setStudents(prev => [...prev, student]);
    else console.error('Add student error:', error);
  };

  const updateStudent = async (updatedStudent: Student) => {
    const { error } = await supabase.from('students').update({
      name: updatedStudent.name, email: updatedStudent.email, phone: updatedStudent.phone,
      class: updatedStudent.class, section: updatedStudent.section,
      roll_number: updatedStudent.rollNumber, gender: updatedStudent.gender,
      date_of_birth: updatedStudent.dateOfBirth, address: updatedStudent.address,
      parent_name: updatedStudent.parentName, parent_phone: updatedStudent.parentPhone,
      subjects: updatedStudent.subjects, blood_group: updatedStudent.bloodGroup,
    }).eq('id', updatedStudent.id);
    if (!error) setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setStudents(prev => prev.filter(s => s.id !== id));
  };

  // ADD TEACHER — creates auth account + profile + teacher record
  const addTeacher = async (teacher: Teacher, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: teacher.email,
      password: password,
    });
    if (authError) { console.error('Auth create error:', authError); return; }

    const authUserId = authData.user?.id;
    if (!authUserId) return;

    await supabase.from('profiles').insert({
      id: authUserId, email: teacher.email, name: teacher.name,
      phone: teacher.phone, role: 'teacher', related_id: teacher.id,
    });

    const { error } = await supabase.from('teachers').insert({
      id: teacher.id, name: teacher.name, email: teacher.email, phone: teacher.phone,
      role: 'teacher', employee_id: teacher.employeeId, department: teacher.department,
      subjects: teacher.subjects, classes: teacher.classes,
      qualification: teacher.qualification, join_date: teacher.joinDate,
    });
    if (!error) setTeachers(prev => [...prev, teacher]);
  };

  const updateTeacher = async (t: Teacher) => {
    const { error } = await supabase.from('teachers').update({
      name: t.name, email: t.email, phone: t.phone, department: t.department,
      subjects: t.subjects, classes: t.classes, qualification: t.qualification,
    }).eq('id', t.id);
    if (!error) setTeachers(prev => prev.map(x => x.id === t.id ? t : x));
  };

  const deleteTeacher = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (!error) setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const addAttendance = async (newAttendance: Attendance) => {
    const { error } = await supabase.from('attendance').insert({
      id: newAttendance.id, student_id: newAttendance.studentId, date: newAttendance.date,
      status: newAttendance.status, marked_by: newAttendance.markedBy,
      subject: newAttendance.subject, class: newAttendance.class,
      section: newAttendance.section, remarks: newAttendance.remarks,
    });
    if (!error) setAttendance(prev => [...prev, newAttendance]);
  };

  const addMark = async (newMark: Mark) => {
    const { error } = await supabase.from('marks').insert({
      id: newMark.id, student_id: newMark.studentId, subject: newMark.subject,
      exam_type: newMark.examType, max_marks: newMark.maxMarks,
      obtained_marks: newMark.obtainedMarks, grade: newMark.grade,
      date: newMark.date, teacher_id: newMark.teacherId,
      class: newMark.class, section: newMark.section,
    });
    if (!error) setMarks(prev => [...prev, newMark]);
  };

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