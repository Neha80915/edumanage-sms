import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Calendar, Award, Clock } from 'lucide-react';

export function StudentAssignments() {
  const { assignments } = useApp();

  const today = new Date();
  const upcoming = assignments.filter(a => new Date(a.dueDate) >= today);
  const past = assignments.filter(a => new Date(a.dueDate) < today);

  const daysUntil = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Due today!';
    if (diff === 1) return 'Due tomorrow';
    return `Due in ${diff} days`;
  };

  const urgencyColor = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) return 'bg-red-100 text-red-600 border-red-200';
    if (diff <= 3) return 'bg-amber-100 text-amber-600 border-amber-200';
    return 'bg-emerald-100 text-emerald-600 border-emerald-200';
  };

  const AssignmentCard = ({ assignment, isPast }: { assignment: typeof assignments[0]; isPast: boolean }) => (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${isPast ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
        {!isPast ? (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${urgencyColor(assignment.dueDate)}`}>
            {daysUntil(assignment.dueDate)}
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500 flex-shrink-0">
            Past Due
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">{assignment.description}</p>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" /> {assignment.subject}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-purple-400" /> {assignment.dueDate}
        </span>
        <span className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-400" /> {assignment.totalMarks} marks
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500 text-sm mt-0.5">Assignments for your class</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-emerald-600">{upcoming.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Upcoming</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-3xl font-bold text-red-500">
            {upcoming.filter(a => Math.ceil((new Date(a.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 3).length}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-1">Due Soon</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-gray-800">Upcoming ({upcoming.length})</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">No upcoming assignments 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => <AssignmentCard key={a.id} assignment={a} isPast={false} />)}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-500">Past Assignments ({past.length})</h2>
          </div>
          <div className="space-y-3">
            {past.map(a => <AssignmentCard key={a.id} assignment={a} isPast={true} />)}
          </div>
        </div>
      )}
    </div>
  );
}