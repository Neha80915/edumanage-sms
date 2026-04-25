import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, TrendingUp, Download, Plus } from 'lucide-react';
import { calculateGPA } from '../data/mockData';

export function Marks() {
  const { students, marks, addMark } = useApp();
  const [selectedClass, setSelectedClass] = useState('10th');
  const [selectedExam, setSelectedExam] = useState('Mid-Term');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  const getStudentMarks = (studentId: string) => {
    return marks.filter(m => m.studentId === studentId && m.examType === selectedExam);
  };

  const calculateTotalMarks = (studentId: string) => {
    const studentMarks = getStudentMarks(studentId);
    const total = studentMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
    const max = studentMarks.reduce((sum, m) => sum + m.maxMarks, 0);
    return { total, max, percentage: max > 0 ? Math.round((total / max) * 100) : 0 };
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Marks & Results</h1>
          <p className="text-gray-600">Manage student marks and generate results</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Marks
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Students</h3>
          <p className="text-3xl text-gray-800">{filteredStudents.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Average GPA</h3>
          <p className="text-3xl text-gray-800">
            {filteredStudents.length > 0
              ? (
                  filteredStudents.reduce((sum, s) => sum + calculateGPA(s.id), 0) /
                  filteredStudents.length
                ).toFixed(2)
              : '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Top Performer</h3>
          <p className="text-lg text-gray-800">
            {filteredStudents.length > 0
              ? filteredStudents.reduce((top, s) =>
                  calculateGPA(s.id) > calculateGPA(top.id) ? s : top
                ).name.split(' ')[0]
              : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm mb-2 text-gray-700">Exam Type</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Unit Test">Unit Test</option>
              <option value="Mid-Term">Mid-Term</option>
              <option value="Final">Final Exam</option>
              <option value="Practical">Practical</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Generate Report Cards
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">GPA</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const { total, max, percentage } = calculateTotalMarks(student.id);
                  const grade = getGrade(percentage);
                  const gpa = calculateGPA(student.id);
                  const studentMarks = getStudentMarks(student.id);

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
                            <p className="text-xs text-gray-500">{student.class}-{student.section}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {studentMarks.length > 0 ? `${total}/${max}` : 'Not Available'}
                      </td>
                      <td className="px-6 py-4">
                        {studentMarks.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${
                                  percentage >= 90
                                    ? 'bg-green-500'
                                    : percentage >= 75
                                    ? 'bg-blue-500'
                                    : percentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-800">{percentage}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {studentMarks.length > 0 ? (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              grade === 'A+' || grade === 'A'
                                ? 'bg-green-100 text-green-800'
                                : grade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : grade === 'C'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {grade}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {gpa > 0 ? gpa.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {studentMarks.length > 0 ? (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              percentage >= 50
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {percentage >= 50 ? 'Pass' : 'Fail'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredStudents
            .sort((a, b) => calculateGPA(b.id) - calculateGPA(a.id))
            .slice(0, 3)
            .map((student, index) => {
              const gpa = calculateGPA(student.id);
              const { percentage } = calculateTotalMarks(student.id);

              return (
                <div key={student.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.class}-{student.section}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">GPA</p>
                      <p className="text-lg text-gray-800">{gpa.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Percentage</p>
                      <p className="text-lg text-gray-800">{percentage}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
