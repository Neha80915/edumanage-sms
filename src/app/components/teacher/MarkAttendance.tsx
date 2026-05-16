import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Lock } from 'lucide-react';

export function MarkAttendance() {
  const { currentUser, students, teachers, attendance, addAttendance } = useApp();

  const teacher = teachers.find(t => t.id === currentUser?.id);

  const [selectedClass, setSelectedClass] = useState(teacher?.classes[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(teacher?.subjects[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'Present' | 'Absent' | 'Late' | 'Excused' }>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!teacher) return <div>Teacher not found</div>;

  const classStudents = students.filter(s => `${s.class} ${s.section}` === selectedClass);

  // Check if attendance already marked for this class + subject + date
  const existingAttMap = new Map(
    attendance
      .filter(a =>
        a.date === selectedDate &&
        a.subject === selectedSubject &&
        `${a.class} ${a.section}` === selectedClass
      )
      .map(a => [a.studentId, a])
  );

  const isAlreadyMarked = classStudents.length > 0 &&
    classStudents.some(s => existingAttMap.has(s.id));

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    if (isAlreadyMarked) return;
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    if (isAlreadyMarked) return;
    const all: { [key: string]: 'Present' | 'Absent' } = {};
    classStudents.forEach(s => { all[s.id] = status; });
    setAttendanceData(all);
  };

  const handleSubmit = async () => {
    if (isAlreadyMarked) return;
    if (Object.keys(attendanceData).length === 0) {
      setMessage('Please mark attendance for at least one student');
      return;
    }
    setIsSubmitting(true);

    for (const [studentId, status] of Object.entries(attendanceData)) {
      const newAttendance = {
        id: `A${Date.now()}-${studentId}`,
        studentId,
        date: selectedDate,
        status,
        markedBy: teacher.id,
        subject: selectedSubject,
        class: selectedClass.split(' ')[0],
        section: selectedClass.split(' ')[1],
      };
      await addAttendance(newAttendance);
    }

    setIsSubmitting(false);
    setMessage(`✓ Attendance marked for ${Object.keys(attendanceData).length} students`);
    setAttendanceData({});
    setTimeout(() => setMessage(''), 3000);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Absent': return 'bg-red-100 text-red-700 border-red-300';
      case 'Late': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Excused': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Mark Attendance</h1>
        <p className="text-gray-600">Mark attendance for your students</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Class</label>
            <select value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setAttendanceData({}); setMessage(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {teacher.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Subject</label>
            <select value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setAttendanceData({}); setMessage(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              {teacher.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Date</label>
            <input type="date" value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setAttendanceData({}); setMessage(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Already marked banner */}
      {isAlreadyMarked && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Attendance already marked</p>
            <p className="text-xs mt-0.5">Attendance for <strong>{selectedSubject}</strong> on <strong>{selectedDate}</strong> has been recorded and is locked.</p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✓') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Students */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-gray-800">Students ({classStudents.length})</h3>
            {!isAlreadyMarked && (
              <p className="text-sm text-gray-500 mt-1">Select status for each student</p>
            )}
          </div>
          {!isAlreadyMarked && (
            <div className="flex gap-2">
              <button onClick={() => markAll('Present')}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
                ✓ All Present
              </button>
              <button onClick={() => markAll('Absent')}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
                ✗ All Absent
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {classStudents.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No students in {selectedClass}</p>
          ) : classStudents.map(student => {
            const existing = existingAttMap.get(student.id);
            const currentStatus = isAlreadyMarked ? existing?.status : attendanceData[student.id];

            return (
              <div key={student.id} className={`p-5 flex items-center justify-between gap-4 ${isAlreadyMarked ? 'opacity-80' : ''}`}>
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isAlreadyMarked ? (
                    // Show locked status badge
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${statusColor(existing?.status || '')}`}>
                        {existing?.status || '—'}
                      </span>
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    // Show interactive buttons
                    (['Present', 'Absent', 'Late', 'Excused'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                          currentStatus === status
                            ? statusColor(status) + ' font-semibold'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isAlreadyMarked && classStudents.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}