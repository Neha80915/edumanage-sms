import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { ManageStudents } from './components/admin/ManageStudents';
import { ManageTeachers } from './components/admin/ManageTeachers';
import { MarkAttendance } from './components/teacher/MarkAttendance';
import { EnterMarks } from './components/teacher/EnterMarks';
import { TeacherStudentView } from './components/teacher/TeacherStudentView';
import { FeeManagement } from './components/admin/FeeManagement';
import { StudentFees } from './components/student/StudentFees';
import { ParentFees } from './components/parent/ParentFees';
import { PayFee } from './components/parent/PayFee';
import { LogOut, LayoutDashboard, Users, GraduationCap, Calendar, FileText, DollarSign } from 'lucide-react';

function AppContent() {
  const { currentUser, logout } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Reset to dashboard whenever user changes
  useEffect(() => {
    setCurrentPage('dashboard');
  }, [currentUser?.id]);

  if (!currentUser) return <Login />;

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Manage Students', icon: GraduationCap },
          { id: 'teachers', label: 'Manage Teachers', icon: Users },
          { id: 'fees', label: 'Fee Management', icon: FileText },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'My Students', icon: GraduationCap },
          { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
          { id: 'marks', label: 'Enter Marks', icon: FileText },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'fees', label: 'My Fees', icon: FileText },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'fees', label: 'Fee Status', icon: FileText },
          { id: 'payfee', label: 'Pay Fees', icon: DollarSign },
        ];
    }
  };

  const renderPage = () => {
    if (currentUser.role === 'admin') {
      switch (currentPage) {
        case 'dashboard': return <AdminDashboard />;
        case 'students': return <ManageStudents />;
        case 'teachers': return <ManageTeachers />;
        case 'fees': return <FeeManagement />;
        default: return <AdminDashboard />;
      }
    } else if (currentUser.role === 'teacher') {
      switch (currentPage) {
        case 'dashboard': return <TeacherDashboard />;
        case 'students': return <TeacherStudentView />;
        case 'attendance': return <MarkAttendance />;
        case 'marks': return <EnterMarks />;
        default: return <TeacherDashboard />;
      }
    } else if (currentUser.role === 'student') {
      if (currentPage === 'fees') return <StudentFees />;
      return <StudentDashboard />;
    } else if (currentUser.role === 'parent') {
      if (currentPage === 'fees') return <ParentFees />;
      if (currentPage === 'payfee') return <PayFee />;
      return <ParentDashboard />;
    }
    return <div>Unknown role</div>;
  };

  const navItems = getNavItems();

  const roleGradients: Record<string, string> = {
    admin: 'from-violet-600 to-indigo-700',
    teacher: 'from-blue-600 to-cyan-600',
    student: 'from-emerald-600 to-teal-600',
    parent: 'from-orange-500 to-amber-600',
  };

  const roleBadge: Record<string, string> = {
    admin: 'bg-violet-500/30 text-violet-200',
    teacher: 'bg-blue-500/30 text-blue-200',
    student: 'bg-emerald-500/30 text-emerald-200',
    parent: 'bg-orange-500/30 text-orange-200',
  };

  const role = currentUser.role;

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>

      {/* Top Header */}
      <div
        className={`bg-gradient-to-r ${roleGradients[role]} px-6 py-0 flex justify-between items-center sticky top-0 z-10 shadow-lg`}
        style={{ minHeight: '64px' }}
      >
        {/* Left — Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">EduManage</h1>
            <p className="text-white/60 text-xs">Student Management System</p>
          </div>
        </div>

        {/* Right — User info + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-white text-xs font-medium leading-tight">{currentUser.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleBadge[role]} capitalize`}>
                {currentUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm font-medium border border-white/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      {navItems.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 sticky top-16 z-10">
          <div className="flex gap-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    isActive
                      ? `border-indigo-600 text-indigo-600 bg-indigo-50/60`
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}