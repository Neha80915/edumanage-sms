import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { currentUser, logout } = useApp();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance' },
    { id: 'marks', icon: Award, label: 'Marks & Results' },
    { id: 'fees', icon: DollarSign, label: 'Fee Management' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const roleColors: Record<string, string> = {
    admin: 'from-violet-500 to-purple-600',
    teacher: 'from-blue-500 to-cyan-500',
    student: 'from-emerald-500 to-teal-500',
    parent: 'from-orange-500 to-amber-500',
  };

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-violet-500/20 text-violet-300',
    teacher: 'bg-blue-500/20 text-blue-300',
    student: 'bg-emerald-500/20 text-emerald-300',
    parent: 'bg-orange-500/20 text-orange-300',
  };

  const role = currentUser?.role || 'admin';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden backdrop-blur-sm" onClick={onToggle} />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 flex flex-col`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />

        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white text-sm font-semibold tracking-wide">EduManage</h1>
              <p className="text-white/40 text-xs">Management System</p>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-white/50 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {currentUser?.name.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser?.name || 'Admin'}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColors[role]}`}>
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 py-2">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); if (window.innerWidth < 1024) onToggle(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-400 to-blue-400 rounded-r-full" />}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-gradient-to-br from-violet-500 to-blue-600 shadow-md' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-white/40" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <span className="text-white/30 text-xs">Version</span>
            <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">v2.0</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export function MobileHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4 border-b border-white/10" style={{ background: '#0f172a' }}>
      <button onClick={onToggle} className="text-white/70 hover:text-white transition">
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-white text-base font-semibold">EduManage</h1>
      </div>
      <div className="w-6" />
    </div>
  );
}