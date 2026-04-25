import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Users, GraduationCap, DollarSign, UserCheck, TrendingUp, ArrowUpRight, BookOpen, Award } from 'lucide-react';

export function AdminDashboard() {
  const { students, teachers, attendance, marks, fees } = useApp();

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalRevenue = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length;

  const todayDate = '2026-04-05';
  const todayAttendance = attendance.filter(a => a.date === todayDate);
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 67;

  const classData = ['8th', '9th', '10th', '11th', '12th'].map(cls => ({
    class: cls,
    students: students.filter(s => s.class === cls).length,
  }));

  const genderData = [
    { name: 'Male', value: students.filter(s => s.gender === 'Male').length, color: '#6366f1' },
    { name: 'Female', value: students.filter(s => s.gender === 'Female').length, color: '#ec4899' },
    { name: 'Other', value: students.filter(s => s.gender === 'Other').length, color: '#14b8a6' },
  ].filter(d => d.value > 0);

  const feeData = [
    { name: 'Paid', value: fees.filter(f => f.status === 'Paid').length, color: '#10b981' },
    { name: 'Pending', value: fees.filter(f => f.status === 'Pending' || f.status === 'Partial').length, color: '#f59e0b' },
    { name: 'Overdue', value: fees.filter(f => f.status === 'Overdue').length, color: '#ef4444' },
  ];

  const avgMarksData = ['Mathematics', 'Physics', 'Chemistry', 'English'].map(subject => {
    const subjectMarks = marks.filter(m => m.subject === subject);
    const avg = subjectMarks.length > 0
      ? Math.round(subjectMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100, 0) / subjectMarks.length)
      : 0;
    return { subject: subject.slice(0, 4), fullSubject: subject, avg };
  });

  const statCards = [
    { label: 'Total Students', value: totalStudents, sub: 'Across all classes', icon: GraduationCap, from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-violet-500/25', glow: 'bg-violet-100 text-violet-600' },
    { label: 'Total Teachers', value: totalTeachers, sub: 'Active faculty', icon: Users, from: 'from-blue-500', to: 'to-cyan-500', shadow: 'shadow-blue-500/25', glow: 'bg-blue-100 text-blue-600' },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, sub: "Today's attendance", icon: UserCheck, from: 'from-emerald-500', to: 'to-teal-500', shadow: 'shadow-emerald-500/25', glow: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}k`, sub: `${pendingFees} pending payments`, icon: DollarSign, from: 'from-orange-500', to: 'to-amber-500', shadow: 'shadow-orange-500/25', glow: 'bg-orange-100 text-orange-600' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
          <p className="font-medium">{label || payload[0].name}</p>
          <p className="text-gray-300">{payload[0].value}{payload[0].name === 'avg' ? '%' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Complete system overview and management</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.from} ${card.to} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${card.glow}`}>
                  <ArrowUpRight className="w-3 h-3" /> +2.4%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs text-gray-400 font-medium">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Students by Class — takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Students by Class</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribution across all grades</p>
            </div>
            <BookOpen className="w-5 h-5 text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="class" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="students" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Gender Split</h3>
              <p className="text-xs text-gray-400 mt-0.5">Student demographics</p>
            </div>
            <Users className="w-5 h-5 text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {genderData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {genderData.map((g, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-gray-600">{g.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Subject Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Subject Performance</h3>
              <p className="text-xs text-gray-400 mt-0.5">Average marks % per subject</p>
            </div>
            <Award className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-4">
            {avgMarksData.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{s.fullSubject}</span>
                  <span className={`font-bold ${s.avg >= 75 ? 'text-emerald-600' : s.avg >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{s.avg}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.avg >= 75 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : s.avg >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                    style={{ width: `${s.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Fee Collection</h3>
              <p className="text-xs text-gray-400 mt-0.5">Current payment status</p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {feeData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {feeData.map((f, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-gray-600">{f.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{f.value} records</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Students + Faculty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Students</h3>
            <span className="text-xs text-indigo-600 font-medium">{totalStudents} total</span>
          </div>
          <div className="space-y-2">
            {students.slice(0, 5).map(student => (
              <div key={student.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                  <p className="text-xs text-gray-400">Class {student.class}{student.section} · Roll {student.rollNumber}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-medium">{student.class}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Faculty Overview</h3>
            <span className="text-xs text-emerald-600 font-medium">{totalTeachers} active</span>
          </div>
          <div className="space-y-2">
            {teachers.map(teacher => (
              <div key={teacher.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{teacher.name}</p>
                  <p className="text-xs text-gray-400">{teacher.department} · {teacher.subjects.join(', ')}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-medium">{teacher.classes.length} cls</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}