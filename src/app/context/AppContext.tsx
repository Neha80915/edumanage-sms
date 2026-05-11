import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { User, Student, Teacher, Parent, Attendance, Mark, Fee, Assignment } from '../types';
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
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
  addStudent: (student: Student, password: string) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (teacher: Teacher, password: string) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addAttendance: (attendance: Attendance) => Promise<void>;
  addMark: (mark: Mark) => Promise<void>;
  updateFee: (fee: Fee) => void;
  addAssignment: (assignment: Assignment) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapStudent = (row: Record<string, unknown>): Student => ({
  id: row.id as string, name: row.name as string, email: row.email as string,
  phone: row.phone as string, class: row.class as string, section: row.section as string,
  rollNumber: row.roll_number as string, gender: row.gender as Student['gender'],
  dateOfBirth: row.date_of_birth as string, address: row.address as string,
  parentId: row.parent_id as string, parentName: row.parent_name as string,
  parentPhone: row.parent_phone as string, admissionDate: row.admission_date as string,
  subjects: (row.subjects as string[]) || [], bloodGroup: row.blood_group as string | undefined,
});

const mapAttendance = (row: Record<string, unknown>): Attendance => ({
  id: row.id as string, studentId: row.student_id as string, date: row.date as string,
  status: row.status as Attendance['status'], markedBy: row.marked_by as string,
  subject: row.subject as string | undefined, class: row.class as string,
  section: row.section as string, remarks: row.remarks as string | undefined,
});

const mapMark = (row: Record<string, unknown>): Mark => ({
  id: row.id as string, studentId: row.student_id as string, subject: row.subject as string,
  examType: row.exam_type as Mark['examType'], maxMarks: row.max_marks as number,
  obtainedMarks: row.obtained_marks as number, grade: row.grade as string,
  date: row.date as string, teacherId: row.teacher_id as string,
  class: row.class as string, section: row.section as string,
});

const mapTeacher = (row: Record<string, unknown>): Teacher => ({
  id: row.id as string, name: row.name as string, email: row.email as string,
  phone: row.phone as string, role: 'teacher' as const,
  employeeId: row.employee_id as string, department: row.department as string,
  subjects: (row.subjects as string[]) || [], classes: (row.classes as string[]) || [],
  qualification: row.qualification as string, joinDate: row.join_date as string,
});

const mapParent = (row: Record<string, unknown>): Parent => ({
  id: row.id as string, name: row.name as string, email: row.email as string,
  phone: row.phone as string, role: 'parent' as const,
  relation: row.relation as Parent['relation'], children: (row.children as string[]) || [],
});

const mapFee = (row: Record<string, unknown>): Fee => ({
  id: row.id as string, studentId: row.student_id as string, amount: row.amount as number,
  paidAmount: row.paid_amount as number, dueDate: row.due_date as string,
  status: row.status as Fee['status'], category: row.category as Fee['category'],
  paymentDate: row.payment_date as string | undefined,
});

const mapAssignment = (row: Record<string, unknown>): Assignment => ({
  id: row.id as string, title: row.title as string, subject: row.subject as string,
  description: row.description as string, dueDate: row.due_date as string,
  teacherId: row.teacher_id as string, class: row.class as string,
  section: row.section as string, totalMarks: row.total_marks as number,
  createdDate: row.created_date as string,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always start fresh — sign out on app mount
    supabase.auth.signOut().then(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });
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
      setLoading(false);
      return;
    }

    const user: User = {
      id: data.related_id || userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };

    setCurrentUser(user);

    // Fetch only what each role needs
    await fetchDataForRole(data.role, user.id);
    setLoading(false);
  };

  const fetchDataForRole = async (role: string, userId: string) => {
    try {
      if (role === 'admin') {
        // Admin needs everything
        const [studentsRes, teachersRes, parentsRes, attendanceRes, marksRes, feesRes, assignmentsRes] = await Promise.all([
          supabase.from('students').select('*').order('roll_number'),
          supabase.from('teachers').select('*'),
          supabase.from('parents').select('*'),
          supabase.from('attendance').select('*'),
          supabase.from('marks').select('*'),
          supabase.from('fees').select('*'),
          supabase.from('assignments').select('*').order('created_date', { ascending: false }),
        ]);
        if (studentsRes.data) setStudents(studentsRes.data.map(mapStudent));
        if (teachersRes.data) setTeachers(teachersRes.data.map(mapTeacher));
        if (parentsRes.data) setParents(parentsRes.data.map(mapParent));
        if (attendanceRes.data) setAttendance(attendanceRes.data.map(mapAttendance));
        if (marksRes.data) setMarks(marksRes.data.map(mapMark));
        if (feesRes.data) setFees(feesRes.data.map(mapFee));
        if (assignmentsRes.data) setAssignments(assignmentsRes.data.map(mapAssignment));

      } else if (role === 'teacher') {
        // Teacher needs: all students, their own attendance & marks, their profile
        const { data: teacherData } = await supabase.from('teachers').select('*').eq('id', userId).single();
        if (teacherData) setTeachers([mapTeacher(teacherData)]);

        const teacherClasses = teacherData?.classes || [];
        const classFilters = teacherClasses.map((c: string) => c.split(' ')[0]);

        const [studentsRes, attendanceRes, marksRes, assignmentsRes] = await Promise.all([
          supabase.from('students').select('*').in('class', classFilters.length ? classFilters : ['']).order('roll_number'),
          supabase.from('attendance').select('*').eq('marked_by', userId),
          supabase.from('marks').select('*').eq('teacher_id', userId),
          supabase.from('assignments').select('*').eq('teacher_id', userId).order('created_date', { ascending: false }),
        ]);
        if (studentsRes.data) setStudents(studentsRes.data.map(mapStudent));
        if (attendanceRes.data) setAttendance(attendanceRes.data.map(mapAttendance));
        if (marksRes.data) setMarks(marksRes.data.map(mapMark));
        if (assignmentsRes.data) setAssignments(assignmentsRes.data.map(mapAssignment));

      } else if (role === 'student') {
        // Student needs: their own profile + attendance, marks, fees, assignments
        const { data: studentData } = await supabase.from('students').select('*').eq('id', userId).single();
        if (studentData) setStudents([mapStudent(studentData)]);

        const studentClass = studentData?.class || '';
        const studentSection = studentData?.section || '';

        const [attendanceRes, marksRes, feesRes, assignmentsRes] = await Promise.all([
          supabase.from('attendance').select('*').eq('student_id', userId),
          supabase.from('marks').select('*').eq('student_id', userId),
          supabase.from('fees').select('*').eq('student_id', userId),
          supabase.from('assignments').select('*').eq('class', studentClass).eq('section', studentSection).order('created_date', { ascending: false }),
        ]);
        if (attendanceRes.data) setAttendance(attendanceRes.data.map(mapAttendance));
        if (marksRes.data) setMarks(marksRes.data.map(mapMark));
        if (feesRes.data) setFees(feesRes.data.map(mapFee));
        if (assignmentsRes.data) setAssignments(assignmentsRes.data.map(mapAssignment));

      } else if (role === 'parent') {
        // Parent needs: their own profile + children's data
        const { data: parentData } = await supabase.from('parents').select('*').eq('id', userId).single();
        if (parentData) setParents([mapParent(parentData)]);

        const childIds: string[] = parentData?.children || [];
        if (childIds.length > 0) {
          const [studentsRes, feesRes, marksRes, attendanceRes] = await Promise.all([
            supabase.from('students').select('*').in('id', childIds),
            supabase.from('fees').select('*').in('student_id', childIds),
            supabase.from('marks').select('*').in('student_id', childIds),
            supabase.from('attendance').select('*').in('student_id', childIds),
          ]);
          if (studentsRes.data) setStudents(studentsRes.data.map(mapStudent));
          if (feesRes.data) setFees(feesRes.data.map(mapFee));
          if (marksRes.data) setMarks(marksRes.data.map(mapMark));
          if (attendanceRes.data) setAttendance(attendanceRes.data.map(mapAttendance));
        }
      }
    } catch (error) {
      toast.error('Failed to load data. Please refresh.');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      toast.error('Login failed. Please check your email and password.');
      return false;
    }
    toast.success('Welcome back!');
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
    if (authError) {
      toast.error(`Failed to create student account: ${authError.message}`);
      return;
    }

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
    if (!error) {
      setStudents(prev => [...prev, student]);
      toast.success(`Student "${student.name}" added successfully!`);
      // 4. Auto-assign fees from fee structure
      const { data: feeStructure } = await supabase
        .from('fee_structure')
        .select('*')
        .eq('class', student.class);
      if (feeStructure && feeStructure.length > 0) {
        for (const fs of feeStructure) {
          const newFeeId = `F${Date.now()}-${student.id}-${fs.id}`;
          await supabase.from('fees').insert({
            id: newFeeId, student_id: student.id, amount: fs.amount,
            paid_amount: 0, due_date: fs.due_date, status: 'Pending',
            category: fs.category, payment_date: null,
          });
          setFees(prev => [...prev, {
            id: newFeeId, studentId: student.id, amount: fs.amount,
            paidAmount: 0, dueDate: fs.due_date, status: 'Pending',
            category: fs.category, paymentDate: null,
          }]);
        }
      }
    }
    else {
      toast.error('Failed to add student. Please try again.');
    }
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
    if (!error) {
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
      toast.success(`Student "${updatedStudent.name}" updated successfully!`);
    } else {
      toast.error('Failed to update student. Please try again.');
    }
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) {
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted successfully.');
    } else {
      toast.error('Failed to delete student. Please try again.');
    }
  };

  // ADD TEACHER — creates auth account + profile + teacher record
  const addTeacher = async (teacher: Teacher, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: teacher.email,
      password: password,
    });
    if (authError) {
      toast.error(`Failed to create teacher account: ${authError.message}`);
      return;
    }

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
    if (!error) {
      setTeachers(prev => [...prev, teacher]);
      toast.success(`Teacher "${teacher.name}" added successfully!`);
    } else {
      toast.error('Failed to add teacher. Please try again.');
    }
  };

  const updateTeacher = async (t: Teacher) => {
    const { error } = await supabase.from('teachers').update({
      name: t.name, email: t.email, phone: t.phone, department: t.department,
      subjects: t.subjects, classes: t.classes, qualification: t.qualification,
    }).eq('id', t.id);
    if (!error) {
      setTeachers(prev => prev.map(x => x.id === t.id ? t : x));
      toast.success(`Teacher "${t.name}" updated successfully!`);
    } else {
      toast.error('Failed to update teacher. Please try again.');
    }
  };

  const deleteTeacher = async (id: string) => {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (!error) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      toast.success('Teacher deleted successfully.');
    } else {
      toast.error('Failed to delete teacher. Please try again.');
    }
  };

  const addAttendance = async (newAttendance: Attendance) => {
    const { error } = await supabase.from('attendance').insert({
      id: newAttendance.id, student_id: newAttendance.studentId, date: newAttendance.date,
      status: newAttendance.status, marked_by: newAttendance.markedBy,
      subject: newAttendance.subject, class: newAttendance.class,
      section: newAttendance.section, remarks: newAttendance.remarks,
    });
    if (!error) {
      setAttendance(prev => [...prev, newAttendance]);
      toast.success('Attendance marked successfully!');
    } else {
      toast.error('Failed to save attendance. Please try again.');
    }
  };

  const addMark = async (newMark: Mark) => {
    const { error } = await supabase.from('marks').insert({
      id: newMark.id, student_id: newMark.studentId, subject: newMark.subject,
      exam_type: newMark.examType, max_marks: newMark.maxMarks,
      obtained_marks: newMark.obtainedMarks, grade: newMark.grade,
      date: newMark.date, teacher_id: newMark.teacherId,
      class: newMark.class, section: newMark.section,
    });
    if (!error) {
      setMarks(prev => [...prev, newMark]);
      toast.success('Marks saved successfully!');
    } else {
      toast.error('Failed to save marks. Please try again.');
    }
  };

  const updateFee = (fee: Fee) => setFees(prev => prev.map(f => f.id === fee.id ? fee : f));

  const addAssignment = async (a: Assignment) => {
    const { error } = await supabase.from('assignments').insert({
      id: a.id, title: a.title, subject: a.subject, description: a.description,
      due_date: a.dueDate, teacher_id: a.teacherId, class: a.class,
      section: a.section, total_marks: a.totalMarks, created_date: a.createdDate,
    });
    if (!error) {
      setAssignments(prev => [a, ...prev]);
      toast.success('Assignment created successfully!');
    } else {
      toast.error('Failed to create assignment. Please try again.');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      students, teachers, parents, attendance, marks, fees, assignments,
      loading, setFees,
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