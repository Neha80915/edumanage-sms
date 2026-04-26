import React from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

export function StudentFees() {
  const { currentUser, fees } = useApp();
  const myFees = fees.filter(f => f.studentId === currentUser?.id);
  const totalAmount = myFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = myFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const balance = totalAmount - paidAmount;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Partial': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Paid': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
        <p className="text-gray-500 text-sm mt-0.5">View your fee payment status</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Fees', value: `₹${totalAmount.toLocaleString()}`, color: 'indigo', icon: DollarSign },
          { label: 'Amount Paid', value: `₹${paidAmount.toLocaleString()}`, color: 'emerald', icon: CheckCircle },
          { label: 'Balance Due', value: `₹${balance.toLocaleString()}`, color: 'red', icon: AlertTriangle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${s.color}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        {myFees.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">No fee records found</div>
        ) : myFees.map(fee => (
          <div key={fee.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(fee.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">{fee.category} Fee</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Due: {fee.dueDate}</span>
                    {fee.paymentDate && <span className="text-xs text-emerald-500">· Paid: {fee.paymentDate}</span>}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(fee.status)}`}>{fee.status}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>₹{fee.paidAmount.toLocaleString()} paid</span>
                <span>₹{fee.amount.toLocaleString()} total</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${fee.status === 'Paid' ? 'bg-emerald-500' : fee.status === 'Overdue' ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min((fee.paidAmount / fee.amount) * 100, 100)}%` }} />
              </div>
              {fee.status !== 'Paid' && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Balance: ₹{(fee.amount - fee.paidAmount).toLocaleString()} — Contact admin to make payment</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        💡 To make a payment, please visit the school admin office. Payments are recorded by the administrator after receiving cash/online transfer.
      </div>
    </div>
  );
}