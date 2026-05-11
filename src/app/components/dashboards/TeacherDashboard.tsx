import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CheckCircle, FileText, Calendar, TrendingUp } from 'lucide-react';

export function TeacherDashboard() {
  const { currentUser, students, teachers, attendance, marks } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const teacher = teachers.find(t => t.id === currentUser?.id);

  const todayDate = new Date().toISOString().split('T')[0];

  const teacherStudents = students.filter(s =>
    teacher?.classes.some(c => c.includes(s.class))
  );

  const totalClasses = teacher?.classes.length ?? 0;
  const totalStudents = teacherStudents.length;
  const todayAttendance = attendance.filter(a =>
    a.markedBy === teacher?.id && a.date === todayDate
  ).length;
  const totalMarksEntered = marks.filter(m => m.teacherId === teacher?.id).length;

  const attendanceStats = [
    { name: 'Present', value: attendance.filter(a => a.markedBy === teacher?.id && a.status === 'Present').length, color: '#10b981' },
    { name: 'Absent', value: attendance.filter(a => a.markedBy === teacher?.id && a.status === 'Absent').length, color: '#ef4444' },
    { name: 'Late', value: attendance.filter(a => a.markedBy === teacher?.id && a.status === 'Late').length, color: '#f59e0b' },
  ];

  const classData = (teacher?.classes ?? []).map(className => ({
    class: className,
    students: students.filter(s => `${s.class} ${s.section}` === className).length,
  }));

  if (!teacher) return <div className="p-8 text-gray-500">Teacher not found</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl mb-2">Welcome, {teacher.name}!</h1>
        <p className="text-blue-100">Department: {teacher.department} | Employee ID: {teacher.employeeId}</p>
        <p className="text-blue-100 mt-1">Subjects: {teacher.subjects.join(', ')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Classes</p>
              <p className="text-3xl mt-1 text-gray-800">{totalClasses}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl mt-1 text-gray-800">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Attendance</p>
              <p className="text-3xl mt-1 text-gray-800">{todayAttendance}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Marks Entered</p>
              <p className="text-3xl mt-1 text-gray-800">{totalMarksEntered}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 border-b-2 transition ${
            activeTab === 'performance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Performance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {attendanceStats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  <span className="text-sm text-gray-600">{stat.name}: {stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class-wise Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">Students per Class</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={classData}>
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">My Classes</h3>
            <div className="space-y-2">
              {teacher.classes.map((className, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-800">{className}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {students.filter(s => `${s.class} ${s.section}` === className).length} students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* My Subjects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">My Subjects</h3>
            <div className="space-y-2">
              {teacher.subjects.map((subject, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-800">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

{activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Marks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">Recently Entered Marks</h3>
            <div className="space-y-3">
              {marks
                .filter(m => m.teacherId === teacher.id)
                .slice(0, 5)
                .map(mark => {
                  const student = students.find(s => s.id === mark.studentId);
                  return (
                    <div key={mark.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-800">{student?.name}</p>
                        <p className="text-xs text-gray-600">{mark.subject} - {mark.examType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-800">{mark.obtainedMarks}/{mark.maxMarks}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {mark.grade}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg mb-4 text-gray-800">Recent Attendance Marked</h3>
            <div className="space-y-3">
              {attendance
                .filter(a => a.markedBy === teacher.id)
                .slice(0, 5)
                .map(att => {
                  const student = students.find(s => s.id === att.studentId);
                  return (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-800">{student?.name}</p>
                        <p className="text-xs text-gray-600">{att.date} - {att.subject}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        att.status === 'Present' ? 'bg-green-100 text-green-800' :
                        att.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}