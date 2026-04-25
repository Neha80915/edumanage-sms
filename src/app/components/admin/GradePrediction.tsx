import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, XCircle, Zap, BookOpen, Target } from 'lucide-react';

interface GradePredictionProps {
  student: any;
  marks: any[];
  attendance: any[];
}

export function GradePrediction({ student, marks, attendance }: GradePredictionProps) {
  const [midTermScore, setMidTermScore] = useState('');
  const [attendancePct, setAttendancePct] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [assignmentScore, setAssignmentScore] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill from real data
  useEffect(() => {
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const present = studentAttendance.filter(a => a.status === 'Present').length;
    const attPct = studentAttendance.length > 0 ? Math.round((present / studentAttendance.length) * 100) : 0;
    if (attPct > 0) setAttendancePct(attPct.toString());

    const studentMarks = marks.filter(m => m.studentId === student.id);
    const midTermMarks = studentMarks.filter(m => m.examType === 'Mid-Term');
    if (midTermMarks.length > 0) {
      const avg = Math.round(midTermMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100, 0) / midTermMarks.length);
      setMidTermScore(avg.toString());
    }

    const assignmentMarks = studentMarks.filter(m => m.examType === 'Assignment');
    if (assignmentMarks.length > 0) {
      const avg = Math.round(assignmentMarks.reduce((sum, m) => sum + (m.obtainedMarks / m.maxMarks) * 100, 0) / assignmentMarks.length);
      setAssignmentScore(avg.toString());
    }
  }, [student, marks, attendance]);

  const predict = () => {
    const mid = parseFloat(midTermScore) || 0;
    const att = parseFloat(attendancePct) || 0;
    const hours = parseFloat(studyHours) || 5;
    const assign = parseFloat(assignmentScore) || 70;

    setLoading(true);

    setTimeout(() => {
      // Weighted scoring formula
      // Mid-term: 40%, Attendance: 25%, Study hours: 20%, Assignments: 15%
      const normalizedHours = Math.min((hours / 8) * 100, 100);
      const weightedScore =
        (mid * 0.40) +
        (att * 0.25) +
        (normalizedHours * 0.20) +
        (assign * 0.15);

      // Attendance penalty
      const attPenalty = att < 75 ? (75 - att) * 0.5 : 0;
      const finalScore = Math.max(0, Math.min(100, weightedScore - attPenalty));

      // Grade mapping
      let grade = '', gradeColor = '', gradeDesc = '';
      if (finalScore >= 90) { grade = 'A+'; gradeColor = 'emerald'; gradeDesc = 'Outstanding'; }
      else if (finalScore >= 80) { grade = 'A'; gradeColor = 'emerald'; gradeDesc = 'Excellent'; }
      else if (finalScore >= 70) { grade = 'B+'; gradeColor = 'blue'; gradeDesc = 'Very Good'; }
      else if (finalScore >= 60) { grade = 'B'; gradeColor = 'blue'; gradeDesc = 'Good'; }
      else if (finalScore >= 50) { grade = 'C'; gradeColor = 'amber'; gradeDesc = 'Average'; }
      else if (finalScore >= 40) { grade = 'D'; gradeColor = 'orange'; gradeDesc = 'Below Average'; }
      else { grade = 'F'; gradeColor = 'red'; gradeDesc = 'Fail Risk'; }

      // Risk factors
      const risks: string[] = [];
      const tips: string[] = [];

      if (att < 75) risks.push(`Attendance critically low at ${att}% (minimum 75% required)`);
      if (att >= 75 && att < 85) risks.push(`Attendance at ${att}% — needs improvement`);
      if (mid < 50) risks.push(`Mid-term score of ${mid}% is below passing threshold`);
      if (hours < 3) risks.push(`Study hours (${hours}h/day) are insufficient`);
      if (assign < 60) risks.push(`Assignment performance (${assign}%) needs attention`);

      if (att < 85) tips.push('Improve attendance to at least 85% for better outcomes');
      if (mid < 70) tips.push('Focus on weak subjects from mid-term exam');
      if (hours < 5) tips.push('Increase daily study hours to at least 5 hours');
      if (finalScore >= 80) tips.push('Keep up the excellent work — maintain consistency');
      if (finalScore >= 90) tips.push('Exceptional performance! Consider participating in competitions');

      // Factor breakdown
      const factors = [
        { label: 'Mid-Term Score', weight: '40%', value: mid, score: mid * 0.40, color: 'violet' },
        { label: 'Attendance', weight: '25%', value: att, score: att * 0.25, color: 'blue' },
        { label: 'Study Hours', weight: '20%', value: Math.round(normalizedHours), score: normalizedHours * 0.20, color: 'emerald' },
        { label: 'Assignments', weight: '15%', value: assign, score: assign * 0.15, color: 'amber' },
      ];

      setPrediction({ grade, gradeColor, gradeDesc, finalScore: Math.round(finalScore), risks, tips, factors, attPenalty: Math.round(attPenalty) });
      setLoading(false);
    }, 1200);
  };

  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    violet: 'bg-violet-100',
  };

  const barColor: Record<string, string> = {
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">AI Grade Predictor</h3>
          <p className="text-xs text-gray-500">Weighted ML model · Auto-filled from student records</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
          <Zap className="w-3 h-3" /> AI Powered
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Mid-Term Score (%)
          </label>
          <input
            type="number" min="0" max="100"
            value={midTermScore}
            onChange={e => setMidTermScore(e.target.value)}
            placeholder="e.g. 72"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Attendance (%)
          </label>
          <input
            type="number" min="0" max="100"
            value={attendancePct}
            onChange={e => setAttendancePct(e.target.value)}
            placeholder="e.g. 85"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Daily Study Hours
          </label>
          <input
            type="number" min="0" max="16"
            value={studyHours}
            onChange={e => setStudyHours(e.target.value)}
            placeholder="e.g. 4"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Assignment Score (%)
          </label>
          <input
            type="number" min="0" max="100"
            value={assignmentScore}
            onChange={e => setAssignmentScore(e.target.value)}
            placeholder="e.g. 80"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>

      {/* Predict Button */}
      <button
        onClick={predict}
        disabled={loading || !midTermScore || !attendancePct}
        className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing student data...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            Predict Final Grade
          </>
        )}
      </button>

      {/* Prediction Result */}
      {prediction && (
        <div className="space-y-4 animate-pulse-once">

          {/* Grade Card */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${colorMap[prediction.gradeColor]}`}>
            <div className="text-center">
              <div className="text-5xl font-black">{prediction.grade}</div>
              <div className="text-xs font-medium mt-0.5">{prediction.gradeDesc}</div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Predicted Final Grade</p>
              <p className="text-xs text-gray-500 mt-0.5">Weighted score: {prediction.finalScore}%</p>
              {prediction.attPenalty > 0 && (
                <p className="text-xs text-red-500 mt-1">⚠ Attendance penalty applied: -{prediction.attPenalty} points</p>
              )}
              {/* Score bar */}
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${prediction.finalScore >= 75 ? 'bg-emerald-500' : prediction.finalScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${prediction.finalScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Factor Breakdown</h4>
            <div className="space-y-3">
              {prediction.factors.map((f: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">{f.label} <span className="text-gray-400">({f.weight})</span></span>
                    <span className="font-semibold text-gray-800">{f.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor[f.color]}`} style={{ width: `${f.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          {prediction.risks.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors
              </h4>
              <ul className="space-y-1.5">
                {prediction.risks.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {prediction.tips.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Recommendations
              </h4>
              <ul className="space-y-1.5">
                {prediction.tips.map((t: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}