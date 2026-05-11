import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, BookOpen, Award } from 'lucide-react';

export function StudentMarks() {
  const { currentUser, marks } = useApp();

  const studentMarks = marks.filter(m => m.studentId === currentUser?.id);

  const avgPercentage = studentMarks.length > 0
    ? Math.round(studentMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100, 0) / studentMarks.length)
    : 0;

  const bestMark = studentMarks.reduce((best, m) => {
    const pct = (m.obtainedMarks / m.maxMarks) * 100;
    return pct > (best ? (best.obtainedMarks / best.maxMarks) * 100 : 0) ? m : best;
  }, null as typeof studentMarks[0] | null);

  const subjectAvgs = Array.from(new Set(studentMarks.map(m => m.subject))).map(subject => {
    const subMarks = studentMarks.filter(m => m.subject === subject);
    const avg = Math.round(subMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100, 0) / subMarks.length);
    return { subject: subject.slice(0, 8), fullSubject: subject, avg };
  });

  const gradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-emerald-100 text-emerald-700';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-700';
    if (grade === 'C') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Marks</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your exam results and subject performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-500">Total Exams</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{studentMarks.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-500">Average Score</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgPercentage}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm text-gray-500">Best Subject</p>
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">{bestMark?.subject || '—'}</p>
        </div>
      </div>

      {/* Subject Averages Chart */}
      {subjectAvgs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Performance by Subject</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectAvgs} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: number, _: string, props: { payload: { fullSubject: string } }) => [`${val}%`, props.payload.fullSubject]}
                contentStyle={{ background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="avg" fill="url(#markGrad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="markGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">All Exam Results</h3>
        {studentMarks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No exam results found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Exam Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Obtained</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Max Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Percentage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentMarks.map(mark => (
                  <tr key={mark.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{mark.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{mark.examType}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{mark.obtainedMarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{mark.maxMarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {Math.round((mark.obtainedMarks / mark.maxMarks) * 100)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${gradeColor(mark.grade)}`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{mark.date}</td>
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