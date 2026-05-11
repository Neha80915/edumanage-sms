import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, Search, Printer } from 'lucide-react';
import { Student } from '../../types';

export function ReportCard() {
  const { students, marks, attendance, fees } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [generating, setGenerating] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.includes(searchTerm)
  );

  const generateReportCard = (student: Student) => {
    setGenerating(true);

    const studentMarks = marks.filter(m => m.studentId === student.id);
    const studentAttendance = attendance.filter(a => a.studentId === student.id);
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    const attendancePct = studentAttendance.length > 0
      ? Math.round((presentCount / studentAttendance.length) * 100) : 0;
    const studentFees = fees.filter(f => f.studentId === student.id);
    const feePaid = studentFees.every(f => f.status === 'Paid');

    // Group marks by subject
    const subjectMap: Record<string, { obtained: number; max: number; examType: string }[]> = {};
    studentMarks.forEach(m => {
      if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
      subjectMap[m.subject].push({ obtained: m.obtainedMarks, max: m.maxMarks, examType: m.examType });
    });

    const subjectResults = Object.entries(subjectMap).map(([subject, exams]) => {
      const totalObtained = exams.reduce((s, e) => s + e.obtained, 0);
      const totalMax = exams.reduce((s, e) => s + e.max, 0);
      const percentage = Math.round((totalObtained / totalMax) * 100);
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' :
        percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';
      const gradePoint = percentage >= 90 ? 10 : percentage >= 80 ? 9 : percentage >= 70 ? 8 :
        percentage >= 60 ? 7 : percentage >= 50 ? 6 : percentage >= 40 ? 5 : 0;
      return { subject, exams, totalObtained, totalMax, percentage, grade, gradePoint };
    });

    const overallPct = subjectResults.length > 0
      ? Math.round(subjectResults.reduce((s, r) => s + r.percentage, 0) / subjectResults.length) : 0;
    const cgpa = subjectResults.length > 0
      ? (subjectResults.reduce((s, r) => s + r.gradePoint, 0) / subjectResults.length).toFixed(1) : '0.0';
    const result = overallPct >= 40 ? 'PASS' : 'FAIL';
    const overallGrade = overallPct >= 90 ? 'A+' : overallPct >= 80 ? 'A' : overallPct >= 70 ? 'B+' :
      overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C' : overallPct >= 40 ? 'D' : 'F';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Report Card - ${student.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; display: flex; justify-content: center; padding: 20px; }
  .page { width: 794px; background: white; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }

  /* Header */
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 32px 40px; text-align: center; position: relative; }
  .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #fbbf24, #f59e0b); }
  .school-name { font-size: 28px; font-weight: 800; letter-spacing: 1px; margin-bottom: 4px; }
  .school-sub { font-size: 13px; opacity: 0.85; letter-spacing: 0.5px; }
  .report-title { margin-top: 16px; display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); padding: 6px 24px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }

  /* Student Info */
  .student-section { padding: 24px 40px; background: #fafafa; border-bottom: 2px solid #e8ecff; }
  .student-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .info-item { background: white; border: 1px solid #e8ecff; border-radius: 8px; padding: 12px 16px; }
  .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 4px; }
  .info-value { font-size: 14px; font-weight: 600; color: #1e1b4b; }

  /* Marks Table */
  .marks-section { padding: 24px 40px; }
  .section-title { font-size: 14px; font-weight: 700; color: #1e1b4b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e8ecff; display: flex; align-items: center; gap-8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; }
  th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; }
  td { padding: 10px 14px; border-bottom: 1px solid #f0f0ff; }
  tr:nth-child(even) { background: #f8f9ff; }
  tr:last-child td { border-bottom: none; }
  .grade-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 12px; }
  .grade-a { background: #d1fae5; color: #065f46; }
  .grade-b { background: #dbeafe; color: #1e40af; }
  .grade-c { background: #fef3c7; color: #92400e; }
  .grade-d { background: #ffe4e6; color: #9f1239; }
  .grade-f { background: #fee2e2; color: #991b1b; }
  .progress-bar { width: 80px; height: 6px; background: #e8ecff; border-radius: 3px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 6px; }
  .progress-fill { height: 100%; border-radius: 3px; }

  /* Summary */
  .summary-section { padding: 20px 40px; background: #f8f9ff; border-top: 2px solid #e8ecff; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
  .summary-card { background: white; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid #e8ecff; }
  .summary-value { font-size: 24px; font-weight: 800; color: #4f46e5; }
  .summary-label { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .result-badge { display: inline-block; padding: 6px 24px; border-radius: 20px; font-weight: 800; font-size: 16px; letter-spacing: 2px; }
  .result-pass { background: #d1fae5; color: #065f46; border: 2px solid #6ee7b7; }
  .result-fail { background: #fee2e2; color: #991b1b; border: 2px solid #fca5a5; }

  /* Remarks */
  .remarks-section { padding: 20px 40px; }
  .remarks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .remark-box { border: 1px solid #e8ecff; border-radius: 8px; padding: 16px; }
  .remark-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 8px; }
  .remark-text { font-size: 13px; color: #374151; line-height: 1.6; }
  .sign-line { border-top: 1px solid #d1d5db; margin-top: 24px; padding-top: 8px; font-size: 11px; color: #9ca3af; text-align: center; }

  /* Footer */
  .footer { padding: 16px 40px; background: #1e1b4b; color: white; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
  .footer-left { opacity: 0.7; }
  .footer-right { display: flex; gap: 16px; opacity: 0.7; }

  /* Print Button */
  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #4f46e5; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(79,70,229,0.4); display: flex; align-items: center; gap: 8px; }
  .print-btn:hover { background: #4338ca; }

  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="school-name">🎓 EduManage School</div>
    <div class="school-sub">Excellence in Education · Affiliated to CBSE · Est. 2010</div>
    <div class="report-title">Academic Progress Report · 2025-26</div>
  </div>

  <!-- Student Info -->
  <div class="student-section">
    <div class="student-grid">
      <div class="info-item">
        <div class="info-label">Student Name</div>
        <div class="info-value">${student.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Roll Number</div>
        <div class="info-value">${student.rollNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Class & Section</div>
        <div class="info-value">${student.class} - ${student.section}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date of Birth</div>
        <div class="info-value">${student.dateOfBirth || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Parent Name</div>
        <div class="info-value">${student.parentName || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Report Generated</div>
        <div class="info-value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  </div>

  <!-- Marks Table -->
  <div class="marks-section">
    <div class="section-title">📊 Academic Performance</div>
    ${subjectResults.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Subject</th>
          <th>Max Marks</th>
          <th>Marks Obtained</th>
          <th>Percentage</th>
          <th>Grade</th>
          <th>Grade Point</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${subjectResults.map(r => `
        <tr>
          <td><strong>${r.subject}</strong></td>
          <td>${r.totalMax}</td>
          <td>${r.totalObtained}</td>
          <td>
            <div class="progress-bar"><div class="progress-fill" style="width:${r.percentage}%;background:${r.percentage >= 75 ? '#10b981' : r.percentage >= 50 ? '#f59e0b' : '#ef4444'}"></div></div>
            ${r.percentage}%
          </td>
          <td><span class="grade-badge ${r.percentage >= 80 ? 'grade-a' : r.percentage >= 60 ? 'grade-b' : r.percentage >= 50 ? 'grade-c' : r.percentage >= 40 ? 'grade-d' : 'grade-f'}">${r.grade}</span></td>
          <td>${r.gradePoint}.0</td>
          <td style="color:${r.percentage >= 40 ? '#065f46' : '#991b1b'};font-weight:600">${r.percentage >= 40 ? '✓ Pass' : '✗ Fail'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : '<p style="color:#9ca3af;text-align:center;padding:24px">No marks recorded yet</p>'}
  </div>

  <!-- Summary -->
  <div class="summary-section">
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-value">${overallPct}%</div>
        <div class="summary-label">Overall Percentage</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${cgpa}</div>
        <div class="summary-label">CGPA (out of 10)</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">${overallGrade}</div>
        <div class="summary-label">Overall Grade</div>
      </div>
      <div class="summary-card">
        <div class="summary-value" style="color:${attendancePct >= 75 ? '#10b981' : '#ef4444'}">${attendancePct}%</div>
        <div class="summary-label">Attendance</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:8px">
      <span class="result-badge ${result === 'PASS' ? 'result-pass' : 'result-fail'}">${result}</span>
    </div>
  </div>

  <!-- Remarks -->
  <div class="remarks-section">
    <div class="remarks-grid">
      <div class="remark-box">
        <div class="remark-title">Class Teacher's Remarks</div>
        <div class="remark-text">${
          overallPct >= 90 ? 'Outstanding performance! Keep up the excellent work.' :
          overallPct >= 75 ? 'Good performance. Consistent effort is commendable.' :
          overallPct >= 60 ? 'Satisfactory performance. More focus needed in weaker subjects.' :
          overallPct >= 40 ? 'Needs improvement. Regular study and practice is advised.' :
          'Performance is below expectation. Immediate attention and extra coaching required.'
        }</div>
        <div class="sign-line">Class Teacher's Signature</div>
      </div>
      <div class="remark-box">
        <div class="remark-title">Principal's Remarks</div>
        <div class="remark-text">${
          attendancePct >= 90 ? 'Excellent attendance record maintained throughout the term.' :
          attendancePct >= 75 ? 'Attendance is satisfactory. Regular presence is encouraged.' :
          'Attendance is below the required 75%. Improvement in attendance is necessary.'
        } Fee Status: ${feePaid ? 'All fees cleared.' : 'Fee payment pending.'}</div>
        <div class="sign-line">Principal's Signature</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">EduManage School · This is a computer generated report card</div>
    <div class="footer-right">
      <span>Roll No: ${student.rollNumber}</span>
      <span>Class: ${student.class}-${student.section}</span>
      <span>AY: 2025-26</span>
    </div>
  </div>
</div>

<button class="print-btn" onclick="window.print()">🖨️ Print Report Card</button>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Card Generator</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate printable report cards for any student</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student by name or roll number..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Student', 'Roll No', 'Class', 'Subjects', 'Action'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No students found</td></tr>
            ) : filteredStudents.map(student => {
              const studentMarks = marks.filter(m => m.studentId === student.id);
              const subjectCount = new Set(studentMarks.map(m => m.subject)).size;
              return (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.rollNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.class} {student.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => generateReportCard(student)}
                      disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Generate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}