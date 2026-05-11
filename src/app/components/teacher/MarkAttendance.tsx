import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

export function MarkAttendance() {
  const { currentUser, students, teachers, attendance, addAttendance } = useApp();

  // Get teacher details
  const teacher = teachers.find(t => t.id === currentUser?.id);

  const [selectedClass, setSelectedClass] = useState(teacher?.classes[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(teacher?.subjects[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: 'Present' | 'Absent' | 'Late' | 'Excused' }>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!teacher) return <div>Teacher not found</div>;

  // Get students for selected class
  const classStudents = students.filter(s => {
    const studentClass = `${s.class} ${s.section}`;
    return studentClass === selectedClass && s.subjects.includes(selectedSubject);
  });

  // Check if attendance already marked for this date/class/subject
  const alreadyMarked = attendance.some(a =>
    a.date === selectedDate &&
    a.class === selectedClass.split(' ')[0] &&
    a.section === selectedClass.split(' ')[1] &&
    a.subject === selectedSubject &&
    a.markedBy === teacher.id
  );

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(attendanceData).length === 0) {
      setMessage('Please mark attendance for at least one student');
      return;
    }

    setIsSubmitting(true);

    // Add attendance records
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
    setMessage(`✓ Attendance marked successfully for ${Object.keys(attendanceData).length} students`);
    setAttendanceData({});
    setTimeout(() => setMessage(''), 3000);
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const newData: { [key: string]: 'Present' | 'Absent' | 'Late' | 'Excused' } = {};
    classStudents.forEach(student => {
      newData[student.id] = status;
    });
    setAttendanceData(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Mark Attendance</h1>
        <p className="text-gray-600">Mark attendance for your classes</p>
      </div>

      {/* Selection Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {teacher.classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {teacher.subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {alreadyMarked && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Attendance has already been marked for this class, subject, and date
            </p>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✓') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => markAll('Present')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Mark All Present
        </button>
        <button
          onClick={() => markAll('Absent')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Mark All Absent
        </button>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg text-gray-800">Students ({classStudents.length})</h3>
        </div>

        <div className="p-6 space-y-3">
          {classStudents.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No students enrolled in {selectedSubject} for {selectedClass}
            </p>
          ) : (
            classStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-800">{student.name}</p>
                  <p className="text-xs text-gray-600">Roll: {student.rollNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'Present')}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      attendanceData[student.id] === 'Present'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Present
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'Absent')}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      attendanceData[student.id] === 'Absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Absent
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'Late')}
                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      attendanceData[student.id] === 'Late'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Late
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {classStudents.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}