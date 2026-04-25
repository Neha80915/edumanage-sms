import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Plus, Edit, Trash2, Eye, QrCode, Download, Upload } from 'lucide-react';
import { Student } from '../types';

export function Students() {
  const { students, addStudent, updateStudent, deleteStudent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'add'>('add');

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.includes(searchTerm) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || student.class === filterClass;
    const matchesSection = filterSection === 'All' || student.section === filterSection;
    return matchesSearch && matchesClass && matchesSection;
  });

  const handleAddStudent = () => {
    setViewMode('add');
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setViewMode('edit');
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleViewStudent = (student: Student) => {
    setViewMode('view');
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudent(id);
    }
  };

  const handleGenerateQR = (student: Student) => {
    alert(`QR Code generated for ${student.name}\nStudent ID: ${student.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Student Management</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <button
          onClick={handleAddStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, roll number, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="All">All Classes</option>
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4">
          <button className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl text-gray-800 mt-1">{filteredStudents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Male Students</p>
          <p className="text-2xl text-gray-800 mt-1">{filteredStudents.filter(s => s.gender === 'Male').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Female Students</p>
          <p className="text-2xl text-gray-800 mt-1">{filteredStudents.filter(s => s.gender === 'Female').length}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Actions</th>
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
                filteredStudents.map((student) => (
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
                    <td className="px-6 py-4 text-sm text-gray-800">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{student.section}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{student.parentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{student.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateQR(student)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
                          title="Generate QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <StudentModal
          mode={viewMode}
          student={selectedStudent}
          onClose={() => setShowModal(false)}
          onSave={(student) => {
            if (viewMode === 'add') {
              addStudent(student);
            } else if (viewMode === 'edit') {
              updateStudent(student);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function StudentModal({
  mode,
  student,
  onClose,
  onSave,
}: {
  mode: 'view' | 'edit' | 'add';
  student: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}) {
  const [formData, setFormData] = useState<Student>(
    student || {
      id: `S${Date.now().toString().slice(-3)}`,
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
      admissionDate: new Date().toISOString().split('T')[0],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl text-gray-800">
            {mode === 'view' ? 'Student Details' : mode === 'edit' ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Class *</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
              >
                <option value="8th">8th</option>
                <option value="9th">9th</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Section *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Roll Number *</label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Parent Name *</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Parent Phone *</label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isViewMode}
                required
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          {!isViewMode && (
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {mode === 'add' ? 'Add Student' : 'Update Student'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
