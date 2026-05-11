import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { BookOpen, Calendar, Trophy, FileText, TrendingUp, User } from 'lucide-react';

export function StudentDashboard() {
  const { currentUser, students, attendance, marks, fees, assignments } = useApp();

  // Use student record from DB, fall back to currentUser profile
  const studentRecord = students.find(s => s.id === currentUser?.id);
  const student = studentRecord ?? {
    id: currentUser?.id || '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    class: '—', section: '—', rollNumber: '—',
    gender: 'Other' as const, dateOfBirth: '—', address: '—',
    parentId: '', parentName: '—', parentPhone: '—',
    admissionDate: '—', subjects: [],
  };

  if (!currentUser) return <div>Please log in.</div>;

  // Calculate stats from real Supabase data
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

  const studentMarks = marks.filter(m => m.studentId === student.id);
  const gpa = studentMarks.length > 0
    ? Math.round((studentMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 10, 0) / studentMarks.length) * 10) / 10
    : 0;

  const studentFee = fees.find(f => f.studentId === student.id);

  // Attendance status
  const attendanceStats = [
    { name: 'Present', value: studentAttendance.filter(a => a.status === 'Present').length, fill: '#10b981' },
    { name: 'Absent', value: studentAttendance.filter(a => a.status === 'Absent').length, fill: '#ef4444' },
    { name: 'Late', value: studentAttendance.filter(a => a.status === 'Late').length, fill: '#f59e0b' },
  ];

  // Subject-wise performance
  const subjectPerformance = studentMarks.map(mark => ({
    subject: mark.subject,
    percentage: Math.round((mark.obtainedMarks / mark.maxMarks) * 100),
    grade: mark.grade,
  }));

  // Attendance radial data
  const attendanceData = [
    {
      name: 'Attendance',
      value: attendancePercentage,
      fill: attendancePercentage >= 75 ? '#10b981' : attendancePercentage >= 60 ? '#f59e0b' : '#ef4444',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl mb-1">{student.name}</h1>
            <p className="text-blue-100">Class: {student.class} {student.section} | Roll No: {student.rollNumber}</p>
            <p className="text-blue-100 text-sm mt-1">{student.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-3xl mt-1 text-gray-800">{attendancePercentage}%</p>
              <p className={`text-xs mt-1 ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                {attendancePercentage >= 75 ? 'Good standing' : 'Below requirement'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">GPA</p>
              <p className="text-3xl mt-1 text-gray-800">{gpa}</p>
              <p className="text-xs mt-1 text-gray-600">Out of 10.0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subjects</p>
              <p className="text-3xl mt-1 text-gray-800">{studentMarks.length}</p>
              <p className="text-xs mt-1 text-gray-600">Enrolled courses</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fee Status</p>
              <p className="text-3xl mt-1 text-gray-800">
                {studentFee?.status === 'Paid' ? '✓' : '!'}
              </p>
              <p className={`text-xs mt-1 ${
                studentFee?.status === 'Paid' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {studentFee?.status || 'No data'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="100%"
              data={attendanceData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise={true}
                dataKey="value"
                cornerRadius={10}
              />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                className="text-4xl fill-gray-800"
              >
                {attendancePercentage}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                className="text-sm fill-gray-600"
              >
                Attendance
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {attendanceStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.fill }}></div>
                <span className="text-sm text-gray-600">{stat.name}: {stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance by Subject */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Marks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Recent Exam Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Subject</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Exam Type</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Marks Obtained</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Grade</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentMarks.map(mark => (
                <tr key={mark.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{mark.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mark.examType}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{mark.obtainedMarks}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mark.maxMarks}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-800' :
                      mark.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {mark.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mark.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="text-sm text-gray-800 mt-1">{student.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Blood Group</p>
            <p className="text-sm text-gray-800 mt-1">{student.bloodGroup || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Parent Name</p>
            <p className="text-sm text-gray-800 mt-1">{student.parentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Parent Phone</p>
            <p className="text-sm text-gray-800 mt-1">{student.parentPhone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="text-sm text-gray-800 mt-1">{student.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}