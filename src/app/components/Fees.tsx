import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, AlertCircle, CheckCircle, Clock, Download, Send } from 'lucide-react';

export function Fees() {
  const { students, fees, updateFee } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredFees = fees.filter(fee =>
    filterStatus === 'All' || fee.status === filterStatus
  );

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const collectedAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pendingAmount = totalAmount - collectedAmount;
  const paidCount = fees.filter(f => f.status === 'Paid').length;
  const overdueCount = fees.filter(f => f.status === 'Overdue').length;

  const getStudent = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const handlePayment = (feeId: string, amount: number) => {
    const fee = fees.find(f => f.id === feeId);
    if (fee) {
      const newPaidAmount = fee.paidAmount + amount;
      const newStatus = newPaidAmount >= fee.amount ? 'Paid' : 'Pending';
      updateFee({
        ...fee,
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : fee.paymentDate,
      });
    }
  };

  const handleSendReminder = (studentId: string) => {
    const student = getStudent(studentId);
    if (student) {
      alert(`Fee reminder sent to ${student.name} via email and SMS`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 text-gray-800">Fee Management</h1>
        <p className="text-gray-600">Track and manage student fee payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Total Fees</h3>
          <p className="text-3xl text-gray-800">₹{(totalAmount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Collected</h3>
          <p className="text-3xl text-gray-800">₹{(collectedAmount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Pending</h3>
          <p className="text-3xl text-gray-800">₹{(pendingAmount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">Overdue</h3>
          <p className="text-3xl text-gray-800">{overdueCount}</p>
        </div>
      </div>

      {/* Collection Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg mb-4 text-gray-800">Fee Collection Progress</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Collection Rate</span>
            <span className="text-gray-800">
              {totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
              style={{ width: `${totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">₹{collectedAmount.toLocaleString()} collected</span>
            <span className="text-gray-600">of ₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-3">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({fees.length})
          </button>
          <button
            onClick={() => setFilterStatus('Paid')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Paid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({fees.filter(f => f.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('Overdue')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Overdue'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No fee records found
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const student = getStudent(fee.studentId);
                  if (!student) return null;

                  const balance = fee.amount - fee.paidAmount;
                  const paymentProgress = (fee.paidAmount / fee.amount) * 100;

                  return (
                    <tr key={fee.id} className="hover:bg-gray-50 transition">
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
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {student.class}-{student.section}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-800">₹{fee.paidAmount.toLocaleString()}</p>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-green-500 h-1 rounded-full"
                              style={{ width: `${paymentProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        ₹{balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {new Date(fee.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs ${
                            fee.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : fee.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {fee.status !== 'Paid' && (
                            <>
                              <button
                                onClick={() => handlePayment(fee.id, balance)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                              >
                                Pay Full
                              </button>
                              <button
                                onClick={() => handleSendReminder(student.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Send Reminder"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {fee.status === 'Paid' && (
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition">
                              View Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Alerts */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-800 mb-2">Overdue Payments</h3>
              <p className="text-sm text-red-700 mb-3">
                {overdueCount} student{overdueCount > 1 ? 's have' : ' has'} overdue payments. Please follow up.
              </p>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                Send Bulk Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
