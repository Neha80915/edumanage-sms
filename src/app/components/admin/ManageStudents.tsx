import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Search, X, Download, Eye, BookOpen, Calendar, TrendingUp, Brain } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GradePrediction } from './GradePrediction';

export function ManageStudents() {
  const { students, addStudent, updateStudent, deleteStudent, marks, attendance } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'profile' | 'prediction'>('profile');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '10th',
    section: 'A',
    rollNumber: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    bloodGroup: 'A+',
    subjects: [] as string[],
  });

  const allSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Physical Education'];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? s.class === filterClass : true;
    const matchesGender = filterGender ? s.gender === filterGender : true;
    return matchesSearch && matchesClass && matchesGender;
  });

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      bloodGroup: student.bloodGroup || 'A+',
      subjects: student.subjects || [],
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      class: '10th',
      section: 'A',
      rollNumber: '',
      gender: 'Male',
      dateOfBirth: '',
      address: '',
      parentName: '',
      parentPhone: '',
      bloodGroup: 'A+',
      subjects: [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudent(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent) {
      await updateStudent({
        ...editingStudent,
        ...formData,
      });
    } else {
      const newStudent = {
        id: `S${Date.now()}`,
        ...formData,
        parentId: `P${Date.now()}`,
        admissionDate: new Date().toISOString().split('T')[0],
      };
      await addStudent(newStudent);
    }

    setShowModal(false);
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Class', 'Section', 'Gender', 'Email', 'Phone', 'Date of Birth', 'Blood Group', 'Address', 'Parent Name', 'Parent Phone', 'Subjects', 'Admission Date'];
    const rows = filteredStudents.map(s => [
      s.rollNumber,
      s.name,
      s.class,
      s.section,
      s.gender,
      s.email,
      s.phone,
      s.dateOfBirth,
      s.bloodGroup || '',
      `"${s.address}"`,
      s.parentName,
      s.parentPhone,
      `"${(s.subjects || []).join(', ')}"`,
      s.admissionDate,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Manage Students</h1>
          <p className="text-gray-600">Add, edit, or remove students</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, roll number, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
          >
            <option value="">All Classes</option>
            <option value="8th">8th</option>
            <option value="9th">9th</option>
            <option value="10th">10th</option>
            <option value="11th">11th</option>
            <option value="12th">12th</option>
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-700"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {(filterClass || filterGender) && (
            <button
              onClick={() => { setFilterClass(''); setFilterGender(''); }}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Roll No</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Class</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Phone</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Subjects</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class} {student.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.subjects?.length || 0} subjects</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedStudent(student); setDetailTab('profile'); setShowDetailModal(true); }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl text-gray-800">
                {editingStudent ? 'Edit Student' : 'Add Student'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
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
                  <label className="block text-sm mb-2 text-gray-700">Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-700">Address *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-700">Enrolled Subjects *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allSubjects.map(subject => (
                      <label key={subject} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (() => {
        const studentMarks = marks.filter(m => m.studentId === selectedStudent.id);
        const studentAttendance = attendance.filter(a => a.studentId === selectedStudent.id);
        const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
        const attendancePct = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 0;

        // Group marks by subject → average
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
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl text-white relative">
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
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{selectedStudent.gender}</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{selectedStudent.bloodGroup || 'Blood Group N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setDetailTab('profile')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${detailTab === 'profile' ? 'bg-white text-indigo-700' : 'text-white/70 hover:bg-white/20'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Profile & Grades
                  </button>
                  <button
                    onClick={() => setDetailTab('prediction')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition ${detailTab === 'prediction' ? 'bg-white text-indigo-700' : 'text-white/70 hover:bg-white/20'}`}
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
                  <h3 className="font-semibold text-gray-700 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-800">{selectedStudent.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="text-gray-800">{selectedStudent.phone}</span></div>
                    <div><span className="text-gray-500">DOB:</span> <span className="text-gray-800">{selectedStudent.dateOfBirth}</span></div>
                    <div><span className="text-gray-500">Admission:</span> <span className="text-gray-800">{selectedStudent.admissionDate}</span></div>
                    <div><span className="text-gray-500">Parent:</span> <span className="text-gray-800">{selectedStudent.parentName}</span></div>
                    <div><span className="text-gray-500">Parent Phone:</span> <span className="text-gray-800">{selectedStudent.parentPhone}</span></div>
                    <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="text-gray-800">{selectedStudent.address}</span></div>
                  </div>
                </div>

                {/* Charts */}
                {subjectData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Subject Performance</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={subjectData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(val: any, _: any, props: any) => [`${val}%`, props.payload.fullSubject]} />
                          <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Radar Chart */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Skill Radar</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={subjectData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <Radar dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">No marks recorded yet for this student.</div>
                )}

                {/* Subject wise marks table */}
                {subjectData.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Subject Breakdown</h3>
                    <div className="space-y-2">
                      {subjectData.map(s => (
                        <div key={s.fullSubject} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-28 truncate">{s.fullSubject}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${s.avg}%` }} />
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
      })()}
    </div>
  );
}