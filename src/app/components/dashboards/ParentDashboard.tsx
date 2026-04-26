import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { User, Calendar, Trophy, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export function ParentDashboard() {
  const { currentUser, students, parents, attendance, marks, fees } = useApp();

  const parent = parents.find(p => p.id === currentUser?.id);
  if (!parent) return <div>Parent not found</div>;

  const children = students.filter(s => parent.children.includes(s.id));
  const child = children[0];

  if (!child) return <div>No children found</div>;

  const childAttendance = attendance.filter(a => a.studentId === child.id);
  const presentCount = childAttendance.filter(a => a.status === 'Present').length;
  const attendancePercentage = childAttendance.length > 0 ? Math.round((presentCount / childAttendance.length) * 100) : 0;

  const childMarks = marks.filter(m => m.studentId === child.id);
  const gpa = childMarks.length > 0
    ? Math.round((childMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 10, 0) / childMarks.length) * 10) / 10
    : 0;

  const childFee = fees.find(f => f.studentId === child.id);
  const recentAttendance = childAttendance.slice(-7).map(a => ({
    date: a.date.split('-')[2],
    status: a.status === 'Present' ? 1 : a.status === 'Late' ? 0.5 : 0,
  }));

  // Subject performance
  const subjectPerformance = childMarks.map(mark => ({
    subject: mark.subject,
    percentage: Math.round((mark.obtainedMarks / mark.maxMarks) * 100),
  }));

  // Alerts
  const alerts = [];
  if (attendancePercentage < 75) {
    alerts.push({ type: 'warning', message: 'Attendance below 75%', icon: AlertTriangle });
  }
  if (childFee && (childFee.status === 'Pending' || childFee.status === 'Overdue')) {
    alerts.push({ type: 'warning', message: 'Fee payment pending', icon: AlertTriangle });
  }
  if (gpa >= 8.5) {
    alerts.push({ type: 'success', message: 'Excellent academic performance!', icon: CheckCircle });
  }

  return (
    <div className="space-y-6">
      {/* Parent Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl mb-2">Welcome, {parent.name}</h1>
        <p className="text-purple-100">Parent Portal - Monitoring {child.name}'s Progress</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
                  }`}
                />
                <p
                  className={`text-sm ${
                    alert.type === 'warning' ? 'text-yellow-800' : 'text-green-800'
                  }`}
                >
                  {alert.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Child Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl text-gray-800">{child.name}</h2>
            <p className="text-gray-600">Class: {child.class} {child.section} | Roll No: {child.rollNumber}</p>
            <p className="text-gray-600 text-sm">{child.email}</p>
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
                {attendancePercentage >= 75 ? 'Good' : 'Below 75%'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              attendancePercentage >= 75 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Calendar className={`w-6 h-6 ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`} />
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
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-3xl mt-1 text-gray-800">{childAttendance.length}</p>
              <p className="text-xs mt-1 text-gray-600">Days marked</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fee Status</p>
              <p className="text-lg mt-1 text-gray-800">{childFee?.status || 'N/A'}</p>
              {childFee && (
                <p className="text-xs mt-1 text-gray-600">
                  ₹{childFee.paidAmount.toLocaleString()} / ₹{childFee.amount.toLocaleString()}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              childFee?.status === 'Paid' ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {childFee?.status === 'Paid' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Recent Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={recentAttendance}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="status" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-2 text-center">Last 7 days (1 = Present, 0.5 = Late, 0 = Absent)</p>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg mb-4 text-gray-800">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectPerformance}>
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Recent Exam Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Subject</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Exam Type</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Marks</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Percentage</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Grade</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {childMarks.map(mark => (
                <tr key={mark.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{mark.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{mark.examType}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {mark.obtainedMarks} / {mark.maxMarks}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {Math.round((mark.obtainedMarks / mark.maxMarks) * 100)}%
                  </td>
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

      {/* Child Personal Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Student Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="text-sm text-gray-800 mt-1">{child.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Blood Group</p>
            <p className="text-sm text-gray-800 mt-1">{child.bloodGroup || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Admission Date</p>
            <p className="text-sm text-gray-800 mt-1">{child.admissionDate}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-gray-600">Address</p>
            <p className="text-sm text-gray-800 mt-1">{child.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}