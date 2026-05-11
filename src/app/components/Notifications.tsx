import React, { useMemo } from 'react';
import { Bell, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from './context/AppContext';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function Notifications() {
  const { currentUser, students, attendance, fees, marks, assignments } = useApp();

  const notifications = useMemo(() => {
    const result: Notification[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (currentUser?.role === 'admin') {
      const studentAttMap = new Map<string, { present: number; total: number }>();
      attendance.forEach(a => {
        const curr = studentAttMap.get(a.studentId) || { present: 0, total: 0 };
        studentAttMap.set(a.studentId, {
          present: curr.present + (a.status === 'Present' ? 1 : 0),
          total: curr.total + 1,
        });
      });
      students.forEach(s => {
        const data = studentAttMap.get(s.id);
        if (data && data.total > 0) {
          const rate = Math.round((data.present / data.total) * 100);
          if (rate < 75) {
            result.push({ id: `att-${s.id}`, type: 'error', title: 'Low Attendance Alert',
              message: `${s.name} (Class ${s.class} ${s.section}) has ${rate}% attendance — below 75% requirement.`,
              date: todayStr, read: false });
          }
        }
      });
      const overdueFees = fees.filter(f => f.status === 'Overdue');
      if (overdueFees.length > 0) {
        result.push({ id: 'fees-overdue', type: 'warning', title: 'Overdue Fee Payments',
          message: `${overdueFees.length} student${overdueFees.length > 1 ? 's have' : ' has'} overdue fee payments pending.`,
          date: todayStr, read: false });
      }
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const recentAsgn = assignments.filter(a => a.createdDate >= weekAgo);
      if (recentAsgn.length > 0) {
        result.push({ id: 'asgn-recent', type: 'info', title: 'New Assignments This Week',
          message: `${recentAsgn.length} new assignment${recentAsgn.length > 1 ? 's were' : ' was'} created by teachers.`,
          date: todayStr, read: true });
      }
      const todayAtt = attendance.filter(a => a.date === todayStr);
      if (todayAtt.length > 0) {
        const presentCount = todayAtt.filter(a => a.status === 'Present').length;
        const rate = Math.round((presentCount / todayAtt.length) * 100);
        result.push({ id: 'today-att', type: rate >= 75 ? 'success' : 'warning', title: "Today's Attendance Summary",
          message: `${presentCount} of ${todayAtt.length} students present today (${rate}%).`,
          date: todayStr, read: true });
      }
    } else if (currentUser?.role === 'student') {
      const myAtt = attendance.filter(a => a.studentId === currentUser.id);
      const present = myAtt.filter(a => a.status === 'Present').length;
      const rate = myAtt.length > 0 ? Math.round((present / myAtt.length) * 100) : 0;
      if (myAtt.length > 0) {
        result.push({ id: 'my-att', type: rate < 75 ? 'error' : 'success',
          title: rate < 75 ? 'Low Attendance Warning' : 'Attendance On Track',
          message: rate < 75 ? `Your attendance is ${rate}% — below 75% minimum. Please attend regularly.`
            : `Your attendance is ${rate}% — you're meeting the requirement. Keep it up!`,
          date: todayStr, read: rate >= 75 });
      }
      assignments.filter(a => new Date(a.dueDate) >= today).slice(0, 3).forEach(a => {
        const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        result.push({ id: `asgn-${a.id}`, type: daysLeft <= 2 ? 'warning' : 'info', title: 'Assignment Due',
          message: `"${a.title}" (${a.subject}) due on ${a.dueDate} — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left.`,
          date: a.createdDate, read: daysLeft > 3 });
      });
      marks.filter(m => m.studentId === currentUser.id).slice(0, 2).forEach(m => {
        const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
        result.push({ id: `mark-${m.id}`, type: pct >= 75 ? 'success' : pct >= 50 ? 'info' : 'warning',
          title: 'Marks Updated',
          message: `${m.examType} — ${m.subject}: ${m.obtainedMarks}/${m.maxMarks} (${pct}%) Grade ${m.grade}.`,
          date: m.date, read: true });
      });
    } else if (currentUser?.role === 'teacher') {
      const markedToday = attendance.filter(a => a.markedBy === currentUser.id && a.date === todayStr);
      result.push({ id: 'att-today', type: markedToday.length === 0 ? 'warning' : 'success',
        title: markedToday.length === 0 ? 'Attendance Not Marked Today' : 'Attendance Marked',
        message: markedToday.length === 0 ? "You haven't marked attendance for any class today."
          : `Marked attendance for ${markedToday.length} student${markedToday.length > 1 ? 's' : ''} today.`,
        date: todayStr, read: markedToday.length > 0 });
      const myUpcoming = assignments.filter(a => a.teacherId === currentUser.id && new Date(a.dueDate) >= today);
      if (myUpcoming.length > 0) {
        result.push({ id: 'my-asgn', type: 'info', title: 'Active Assignments',
          message: `You have ${myUpcoming.length} active assignment${myUpcoming.length > 1 ? 's' : ''} with upcoming deadlines.`,
          date: todayStr, read: true });
      }
    } else if (currentUser?.role === 'parent') {
      const child = students[0];
      if (child) {
        const childAtt = attendance.filter(a => a.studentId === child.id);
        const childPresent = childAtt.filter(a => a.status === 'Present').length;
        const childRate = childAtt.length > 0 ? Math.round((childPresent / childAtt.length) * 100) : 0;
        if (childAtt.length > 0) {
          result.push({ id: 'child-att', type: childRate < 75 ? 'error' : 'success',
            title: childRate < 75 ? "Child's Low Attendance" : "Child's Attendance Good",
            message: childRate < 75 ? `${child.name}'s attendance is ${childRate}% — below required 75%.`
              : `${child.name}'s attendance is ${childRate}% — meeting the requirement.`,
            date: todayStr, read: childRate >= 75 });
        }
      }
      const myOverdue = fees.filter(f => f.status === 'Overdue');
      if (myOverdue.length > 0) {
        result.push({ id: 'parent-fees', type: 'error', title: 'Fee Payment Overdue',
          message: `${myOverdue.length} fee payment${myOverdue.length > 1 ? 's are' : ' is'} overdue. Please pay at the earliest.`,
          date: todayStr, read: false });
      }
      const paidFees = fees.filter(f => f.status === 'Paid');
      if (paidFees.length > 0) {
        result.push({ id: 'parent-paid', type: 'success', title: 'Fee Payment Confirmed',
          message: `${paidFees.length} fee payment${paidFees.length > 1 ? 's have' : ' has'} been successfully processed.`,
          date: todayStr, read: true });
      }
    }

    return result.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [currentUser, students, attendance, fees, marks, assignments]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-0.5">Smart alerts based on your real data</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{unread}</p>
          <p className="text-xs text-gray-400 mt-1">Unread</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{notifications.length - unread}</p>
          <p className="text-xs text-gray-400 mt-1">Read</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-300 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`border rounded-2xl p-5 ${getBgColor(n.type)} ${!n.read ? 'border-l-4' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {n.title}
                    {!n.read && <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">New</span>}
                  </h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {new Date(n.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}