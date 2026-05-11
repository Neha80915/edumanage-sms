import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export function StudentAttendance() {
  const { currentUser, attendance } = useApp();
  const [filterMonth, setFilterMonth] = useState('');

  const studentAttendance = attendance
    .filter(a => a.studentId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filterMonth
    ? studentAttendance.filter(a => a.date.startsWith(filterMonth))
    : studentAttendance;

  const total = studentAttendance.length;
  const present = studentAttendance.filter(a => a.status === 'Present').length;
  const absent = studentAttendance.filter(a => a.status === 'Absent').length;
  const late = studentAttendance.filter(a => a.status === 'Late').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Late': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      case 'Late': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // Unique months for filter dropdown
  const months = Array.from(new Set(studentAttendance.map(a => a.date.slice(0, 7)))).sort().reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your attendance record across all subjects</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className={`text-3xl font-bold mb-1 ${percentage >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
            {percentage}%
          </div>
          <p className="text-xs text-gray-400 font-medium">Overall rate</p>
          <p className={`text-xs mt-1 font-medium ${percentage >= 75 ? 'text-emerald-500' : 'text-red-500'}`}>
            {percentage >= 75 ? 'Good standing' : '⚠ Below 75%'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-3xl font-bold text-emerald-600 mb-1">{present}</div>
          <p className="text-xs text-gray-400 font-medium">Present</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-3xl font-bold text-red-500 mb-1">{absent}</div>
          <p className="text-xs text-gray-400 font-medium">Absent</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-3xl font-bold text-amber-500 mb-1">{late}</div>
          <p className="text-xs text-gray-400 font-medium">Late</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Attendance Progress</span>
          <span className={`text-sm font-bold ${percentage >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
            {percentage}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage >= 75 ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
              : percentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-400'
              : 'bg-gradient-to-r from-red-400 to-rose-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>0%</span>
          <span className="text-amber-500 font-medium">75% required</span>
          <span>100%</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Attendance Records</h3>
          </div>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All months</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{record.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.subject || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.class} {record.section}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {statusIcon(record.status)}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{record.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}