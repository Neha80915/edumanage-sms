import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, UserCheck, UserX, Clock, AlertCircle, Download } from 'lucide-react';
import { calculateAttendancePercentage } from '../data/mockData';

export function Attendance() {
  const { students, attendance, addAttendance } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'Present' | 'Absent' | 'Late' | 'Excused' }>({});

  const filteredStudents = students.filter(
    s => s.class === selectedClass && s.section === selectedSection
  );

  const todayAttendance = attendance.filter(a => a.date === selectedDate);
  const presentCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

  const handleMarkAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setAttendanceData({ ...attendanceData, [studentId]: status });
  };

  const handleSubmit = () => {
    Object.entries(attendanceData).forEach(([studentId, status]) => {
      addAttendance({
        id: `A${Date.now()}${Math.random()}`,
        studentId,
        date: selectedDate,
        status,
      });
    });
    setAttendanceData({});
    alert('Attendance marked successfully!');
  };

  const getAttendanceStatus = (studentId: string) => {
    if (attendanceData[studentId]) return attendanceData[studentId];
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record?.status || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Attendance Management</h1>
        <p className="text-gray-600">Mark and track student attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Present Today</h3>
          <p className="text-3xl text-gray-800">{presentCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Absent Today</h3>
          <p className="text-3xl text-gray-800">{absentCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Students</h3>
          <p className="text-3xl text-gray-800">{filteredStudents.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Attendance Rate</h3>
          <p className="text-3xl text-gray-800">
            {todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Attendance %</th>
                <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase tracking-wider">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No students found for this class
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = getAttendanceStatus(student.id);
                  const attendancePercentage = calculateAttendancePercentage(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">{student.class}-{student.section}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                attendancePercentage >= 90
                                  ? 'bg-green-500'
                                  : attendancePercentage >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-800 min-w-[45px]">{attendancePercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'Present')}
                            className={`px-3 py-1 rounded text-sm transition ${
                              currentStatus === 'Present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'Absent')}
                            className={`px-3 py-1 rounded text-sm transition ${
                              currentStatus === 'Absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'Late')}
                            className={`px-3 py-1 rounded text-sm transition ${
                              currentStatus === 'Late'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {Object.keys(attendanceData).length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Attendance ({Object.keys(attendanceData).length} students)
            </button>
          </div>
        )}
      </div>

      {/* Attendance Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-800 mb-2">Low Attendance Alert</h3>
            <p className="text-sm text-yellow-700 mb-3">
              The following students have attendance below 75%:
            </p>
            <div className="space-y-2">
              {students
                .filter(s => calculateAttendancePercentage(s.id) < 75)
                .map(student => (
                  <div key={student.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="text-sm text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.class}-{student.section}</p>
                    </div>
                    <span className="text-sm text-red-600">
                      {calculateAttendancePercentage(student.id)}%
                    </span>
                  </div>
                ))}
              {students.filter(s => calculateAttendancePercentage(s.id) < 75).length === 0 && (
                <p className="text-sm text-gray-600">No students with low attendance</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
