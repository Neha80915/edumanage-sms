import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Save } from 'lucide-react';

export function EnterMarks() {
  const { currentUser, students, teachers, addMark } = useApp();

  // Get teacher details
  const teacher = teachers.find(t => t.id === currentUser?.id);

  const [selectedClass, setSelectedClass] = useState(teacher?.classes[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(teacher?.subjects[0] || '');
  const [selectedExamType, setSelectedExamType] = useState<'Mid-Term' | 'Final' | 'Unit Test' | 'Assignment' | 'Quiz'>('Mid-Term');
  const [maxMarks, setMaxMarks] = useState('100');
  const [marksData, setMarksData] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!teacher) return <div>Teacher not found</div>;

  // Get students for selected class
  const classStudents = students.filter(s => {
    const studentClass = `${s.class} ${s.section}`;
    return studentClass === selectedClass && s.subjects.includes(selectedSubject);
  });

  const handleMarksChange = (studentId: string, value: string) => {
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value);
      if (value === '' || (numValue >= 0 && numValue <= parseInt(maxMarks))) {
        setMarksData(prev => ({
          ...prev,
          [studentId]: value,
        }));
      }
    }
  };

  const calculateGrade = (obtained: number, max: number): string => {
    const percentage = (obtained / max) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const handleSubmit = async () => {
    if (Object.keys(marksData).length === 0) {
      setMessage('Please enter marks for at least one student');
      return;
    }

    if (!maxMarks || parseInt(maxMarks) <= 0) {
      setMessage('Please enter valid maximum marks');
      return;
    }

    setIsSubmitting(true);

    // Add mark records
    for (const [studentId, marks] of Object.entries(marksData)) {
      if (marks !== '') {
        const obtainedMarks = parseInt(marks);
        const maximum = parseInt(maxMarks);
        const newMark = {
          id: `M${Date.now()}-${studentId}`,
          studentId,
          subject: selectedSubject,
          examType: selectedExamType,
          maxMarks: maximum,
          obtainedMarks,
          grade: calculateGrade(obtainedMarks, maximum),
          date: new Date().toISOString().split('T')[0],
          teacherId: teacher.id,
          class: selectedClass.split(' ')[0],
          section: selectedClass.split(' ')[1],
        };
        await addMark(newMark);
      }
    }

    setIsSubmitting(false);
    setMessage(`✓ Marks saved successfully for ${Object.keys(marksData).filter(k => marksData[k] !== '').length} students`);
    setMarksData({});
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Enter Marks</h1>
        <p className="text-gray-600">Enter exam marks for your students</p>
      </div>

      {/* Selection Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="block text-sm mb-2 text-gray-700">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value as 'Mid-Term' | 'Final' | 'Unit Test' | 'Assignment' | 'Quiz')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Mid-Term">Mid-Term</option>
              <option value="Final">Final</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-700">Maximum Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✓') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg text-gray-800">Students ({classStudents.length})</h3>
          <p className="text-sm text-gray-600 mt-1">Enter marks out of {maxMarks}</p>
        </div>

        <div className="overflow-x-auto">
          {classStudents.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No students enrolled in {selectedSubject} for {selectedClass}
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Marks Obtained</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Grade (Preview)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classStudents.map(student => {
                  const obtainedMarks = marksData[student.id] ? parseInt(marksData[student.id]) : 0;
                  const maximum = parseInt(maxMarks) || 100;
                  const grade = marksData[student.id] ? calculateGrade(obtainedMarks, maximum) : '-';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={marksData[student.id] || ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          placeholder="0"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade === 'B+' || grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade === 'D' || grade === 'F' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              {isSubmitting ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}