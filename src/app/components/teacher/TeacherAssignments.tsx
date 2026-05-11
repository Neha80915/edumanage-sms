import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, X, BookOpen, Calendar, Award, Trash2 } from 'lucide-react';
import { Assignment } from '../../types';

export function TeacherAssignments() {
  const { currentUser, teachers, assignments, addAssignment } = useApp();
  const teacher = teachers.find(t => t.id === currentUser?.id);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: teacher?.subjects[0] || '',
    description: '',
    class: teacher?.classes[0]?.split(' ')[0] || '',
    section: teacher?.classes[0]?.split(' ')[1] || 'A',
    dueDate: '',
    totalMarks: '20',
  });

  const teacherAssignments = assignments.filter(a => a.teacherId === currentUser?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setIsSubmitting(true);

    const newAssignment: Assignment = {
      id: `AS${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      description: formData.description,
      class: formData.class,
      section: formData.section,
      teacherId: teacher.id,
      dueDate: formData.dueDate,
      totalMarks: parseInt(formData.totalMarks),
      createdDate: new Date().toISOString().split('T')[0],
    };

    await addAssignment(newAssignment);
    setIsSubmitting(false);
    setShowModal(false);
    setFormData({
      title: '',
      subject: teacher.subjects[0] || '',
      description: '',
      class: teacher.classes[0]?.split(' ')[0] || '',
      section: teacher.classes[0]?.split(' ')[1] || 'A',
      dueDate: '',
      totalMarks: '20',
    });
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (!teacher) return <div>Teacher not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage assignments for your classes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-gray-900">{teacherAssignments.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Total Created</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-emerald-600">
            {teacherAssignments.filter(a => !isOverdue(a.dueDate)).length}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-1">Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-red-500">
            {teacherAssignments.filter(a => isOverdue(a.dueDate)).length}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-1">Past Due</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {teacherAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No assignments yet</p>
            <p className="text-gray-300 text-sm mt-1">Click "New Assignment" to create one</p>
          </div>
        ) : (
          teacherAssignments.map(assignment => (
            <div key={assignment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      isOverdue(assignment.dueDate)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {isOverdue(assignment.dueDate) ? 'Past Due' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{assignment.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {assignment.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due: {assignment.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {assignment.totalMarks} marks
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      Class {assignment.class} {assignment.section}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">New Assignment</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chapter 5 Practice Problems"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {teacher.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    value={`${formData.class} ${formData.section}`}
                    onChange={e => {
                      const [cls, sec] = e.target.value.split(' ');
                      setFormData({ ...formData, class: cls, section: sec });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {teacher.classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the assignment tasks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date" required
                    value={formData.dueDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks *</label>
                  <input
                    type="number" required min="1" max="100"
                    value={formData.totalMarks}
                    onChange={e => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  )}
                  {isSubmitting ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}