import React from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

export function ParentFees() {
  const { currentUser, students, parents, fees } = useApp();
  const parent = parents.find(p => p.id === currentUser?.id);
  const children = parent ? students.filter(s => parent.children.includes(s.id)) : [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Partial': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee Payment Status</h1>
        <p className="text-gray-500 text-sm mt-0.5">View fee details for your children</p>
      </div>
      {children.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">No children linked to your account</div>
      ) : children.map(child => {
        const childFees = fees.filter(f => f.studentId === child.id);
        const totalAmount = childFees.reduce((sum, f) => sum + f.amount, 0);
        const paidAmount = childFees.reduce((sum, f) => sum + f.paidAmount, 0);
        const balance = totalAmount - paidAmount;
        return (
          <div key={child.id} className="space-y-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">{child.name.charAt(0)}</div>
              <div>
                <p className="font-bold">{child.name}</p>
                <p className="text-white/80 text-sm">Class {child.class} {child.section} · Roll No: {child.rollNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Fees', value: `₹${totalAmount.toLocaleString()}`, color: 'text-gray-900' },
                { label: 'Paid', value: `₹${paidAmount.toLocaleString()}`, color: 'text-emerald-600' },
                { label: 'Balance', value: `₹${balance.toLocaleString()}`, color: 'text-red-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {childFees.map(fee => (
                <div key={fee.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{fee.category} Fee</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">Due: {fee.dueDate}</span>
                        {fee.paymentDate && <span className="text-xs text-emerald-500">· Paid: {fee.paymentDate}</span>}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(fee.status)}`}>{fee.status}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${fee.status === 'Paid' ? 'bg-emerald-500' : fee.status === 'Overdue' ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min((fee.paidAmount / fee.amount) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>₹{fee.paidAmount.toLocaleString()} paid</span>
                    <span>₹{fee.amount.toLocaleString()} total</span>
                  </div>
                  {fee.status !== 'Paid' && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Balance: ₹{(fee.amount - fee.paidAmount).toLocaleString()} pending</p>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              💡 To make a payment, visit the school admin office. Payments are recorded by the administrator after receiving cash/bank transfer.
            </div>
          </div>
        );
      })}
    </div>
  );
}