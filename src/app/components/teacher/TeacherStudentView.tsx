import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Eye, X, TrendingUp, BookOpen, Calendar, Brain } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GradePrediction } from '../admin/GradePrediction';

export function TeacherStudentView() {
  const { currentUser, students, teachers, marks, attendance } = useApp();
  const teacher = teachers.find(t => t.id === currentUser?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'prediction'>('profile');

  // Only show students in teacher's classes
  const teacherStudents = students.filter(s =>
    teacher?.classes.some(c => c.includes(s.class))
  );

  const filteredStudents = teacherStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.includes(searchTerm);
    const matchesClass = filterClass ? s.class === filterClass : true;
    return matchesSearch && matchesClass;
  });

  const teacherClasses = [...new Set(teacher?.classes.map(c => c.split(' ')[0]) || [])];

  // Detail modal logic (same as ManageStudents but read-only)
  const renderDetailModal = () => {
    if (!showDetailModal || !selectedStudent) return null;

    const studentMarks = marks.filter(m => m.studentId === selectedStudent.id);
    const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id);
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    const attendancePct = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

    const subjectMap: Record<string, number[]> = {};
    studentMarks.forEach(m => {
      const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
      if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
      subjectMap[m.subject].push(pct);
    });
    const subjectData = Object.entries(subjectMap).map(([subject, scores]) => ({
      subject: subject.length > 8 ? subject.slice(0, 8) + '…' : subject,
      fullSubject: subject,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
    const overallAvg = subjectData.length > 0 ? Math.round(subjectData.reduce((a, b) => a + b.avg, 0) / subjectData.length) : 0;
    const getGrade = (avg: number) => avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';
    const getColor = (avg: number) => avg >= 75 ? 'text-green-600 bg-green-50' : avg >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-2xl text-white relative">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                <p className="text-blue-100">{selectedStudent.rollNumber} · Class {selectedStudent.class} {selectedStudent.section}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{selectedStudent.gender}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{selectedStudent.bloodGroup || 'N/A'}</span>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDetailTab('profile')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${detailTab === 'profile' ? 'bg-white text-blue-700' : 'text-white/70 hover:bg-white/20'}`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Profile & Grades
              </button>
              <button
                onClick={() => setDetailTab('prediction')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${detailTab === 'prediction' ? 'bg-white text-blue-700' : 'text-white/70 hover:bg-white/20'}`}
              >
                <Brain className="w-3.5 h-3.5" /> AI Grade Prediction
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {detailTab === 'profile' ? (<>
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{overallAvg}%</p>
                  <p className="text-xs text-blue-500">Overall Avg</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">{getGrade(overallAvg)}</p>
                  <p className="text-xs text-purple-500">Grade</p>
                </div>
                <div className={`rounded-xl p-4 text-center ${attendancePct >= 75 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Calendar className={`w-6 h-6 mx-auto mb-1 ${attendancePct >= 75 ? 'text-green-600' : 'text-red-600'}`} />
                  <p className={`text-2xl font-bold ${attendancePct >= 75 ? 'text-green-700' : 'text-red-700'}`}>{attendancePct}%</p>
                  <p className={`text-xs ${attendancePct >= 75 ? 'text-green-500' : 'text-red-500'}`}>Attendance</p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="text-gray-800">{selectedStudent.email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="text-gray-800">{selectedStudent.phone}</span></div>
                  <div><span className="text-gray-500">DOB:</span> <span className="text-gray-800">{selectedStudent.dateOfBirth}</span></div>
                  <div><span className="text-gray-500">Parent:</span> <span className="text-gray-800">{selectedStudent.parentName}</span></div>
                  <div><span className="text-gray-500">Parent Phone:</span> <span className="text-gray-800">{selectedStudent.parentPhone}</span></div>
                  <div><span className="text-gray-500">Address:</span> <span className="text-gray-800">{selectedStudent.address}</span></div>
                </div>
              </div>

              {/* Charts */}
              {subjectData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Subject Performance</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={subjectData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(val: any, _: any, props: any) => [`${val}%`, props.payload.fullSubject]} />
                        <Bar dataKey="avg" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Skill Radar</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={subjectData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <Radar dataKey="avg" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No marks recorded yet.</div>
              )}

              {/* Subject Breakdown */}
              {subjectData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Subject Breakdown</h3>
                  <div className="space-y-2">
                    {subjectData.map(s => (
                      <div key={s.fullSubject} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-28 truncate">{s.fullSubject}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-cyan-500 transition-all" style={{ width: `${s.avg}%` }} />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getColor(s.avg)}`}>{s.avg}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>) : (
              <GradePrediction student={selectedStudent} marks={marks} attendance={attendance} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">View profiles and grade predictions for your class</p>
        </div>
        <span className="text-sm bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg font-medium">
          {filteredStudents.length} students
        </span>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
          >
            <option value="">All Classes</option>
            {teacherClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roll No</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No students found</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.class} {student.section}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.subjects?.length || 0} subjects</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => { setSelectedStudent(student); setDetailTab('profile'); setShowDetailModal(true); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderDetailModal()}
    </div>
  );
}