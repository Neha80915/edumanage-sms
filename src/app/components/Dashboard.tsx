import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserCheck, DollarSign, BookOpen, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateAttendancePercentage, calculateGPA } from '../data/mockData';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const { students, teachers, attendance, fees, marks } = useApp();

  // Calculate statistics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const todayAttendance = attendance.filter(a => a.date === '2026-04-05');
  const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 0;

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const collectedFees = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pendingFees = totalFees - collectedFees;

  // Class distribution data
  const classData = [
    { name: '8th', students: students.filter(s => s.class === '8th').length },
    { name: '9th', students: students.filter(s => s.class === '9th').length },
    { name: '10th', students: students.filter(s => s.class === '10th').length },
    { name: '11th', students: students.filter(s => s.class === '11th').length },
    { name: '12th', students: students.filter(s => s.class === '12th').length },
  ];

  // Attendance trend data
  const attendanceTrend = [
    { date: 'Apr 1', rate: 92 },
    { date: 'Apr 2', rate: 88 },
    { date: 'Apr 3', rate: 95 },
    { date: 'Apr 4', rate: 90 },
    { date: 'Apr 5', rate: attendanceRate },
  ];

  // Fee status data
  const feeData = [
    { name: 'Paid', value: fees.filter(f => f.status === 'Paid').length },
    { name: 'Pending', value: fees.filter(f => f.status === 'Pending').length },
    { name: 'Overdue', value: fees.filter(f => f.status === 'Overdue').length },
  ];

  // Performance data
  const performanceData = students.slice(0, 5).map(student => ({
    name: student.name.split(' ')[0],
    attendance: calculateAttendancePercentage(student.id),
    gpa: calculateGPA(student.id) * 10,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your school overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Students</h3>
          <p className="text-3xl text-gray-800">{totalStudents}</p>
        </div>

        {/* Total Teachers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +3%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Teachers</h3>
          <p className="text-3xl text-gray-800">{totalTeachers}</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-red-600 text-sm flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              -2%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Attendance Today</h3>
          <p className="text-3xl text-gray-800">{attendanceRate}%</p>
        </div>

        {/* Fee Collection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +18%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Fees Collected</h3>
          <p className="text-3xl text-gray-800">₹{(collectedFees / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Students by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Attendance Trend (5 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Fee Payment Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Student Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Attendance %" />
              <Bar dataKey="gpa" fill="#10b981" radius={[8, 8, 0, 0]} name="GPA (x10)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">New student enrolled: Ananya Verma</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Attendance marked for 10th-A</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Fee payment received: ₹50,000</p>
              <p className="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
