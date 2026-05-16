import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { DollarSign, Plus, CheckCircle, Clock, AlertTriangle, Search, X, TrendingUp, Users, Edit } from 'lucide-react';
import { Fee } from '../../types';

interface FeeStructure {
  id: string;
  class: string;
  category: string;
  amount: number;
  due_date: string;
  academic_year: string;
}

export function FeeManagement() {
  const { students, fees, setFees } = useApp();
  const [activeTab, setActiveTab] = useState<'payments' | 'structure'>('payments');
  const [feeStructure, setFeeStructure] = useState<FeeStructure[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClass, setFilterClass] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [structureForm, setStructureForm] = useState({ class: '10th', category: 'Tuition', amount: '', due_date: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchFeeStructure(); }, []);

  const fetchFeeStructure = async () => {
    const { data } = await supabase.from('fee_structure').select('*').order('class');
    if (data) setFeeStructure(data);
  };

  const getStudent = (studentId: string) => students.find(s => s.id === studentId);

  // Stats
  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const collectedAmount = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const pendingAmount = totalAmount - collectedAmount;
  const paidCount = fees.filter(f => f.status === 'Paid').length;
  const overdueCount = fees.filter(f => f.status === 'Overdue').length;
  const pendingCount = fees.filter(f => f.status === 'Pending' || f.status === 'Partial').length;

  // Filter fees
  const filteredFees = fees.filter(fee => {
    const student = getStudent(fee.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.rollNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || fee.status === filterStatus;
    const matchesClass = filterClass ? student?.class === filterClass : true;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleMarkPaid = async () => {
    if (!selectedFee || !payAmount) return;
    setLoading(true);
    const newPaidAmount = selectedFee.paidAmount + parseFloat(payAmount);
    const newStatus = newPaidAmount >= selectedFee.amount ? 'Paid' : 'Partial';
    const { error } = await supabase.from('fees').update({
      paid_amount: newPaidAmount,
      status: newStatus,
      payment_date: paymentDate,
    }).eq('id', selectedFee.id);
    if (!error) {
      setFees((prev: Fee[]) => prev.map(f => f.id === selectedFee.id ? {
        ...f, paidAmount: newPaidAmount, status: newStatus, paymentDate: paymentDate
      } : f));
    }
    setShowPayModal(false);
    setPayAmount('');
    setLoading(false);
  };

  const handleAddStructure = async () => {
    if (!structureForm.amount || !structureForm.due_date) return;
    setLoading(true);
    const newId = `FS${Date.now()}`;
    const { error } = await supabase.from('fee_structure').insert({
      id: newId, ...structureForm, amount: parseFloat(structureForm.amount), academic_year: '2025-2026'
    });
    if (!error) {
      // Auto-generate fees for students in this class
      const classStudents = students.filter(s => s.class === structureForm.class);
      for (const student of classStudents) {
        await supabase.from('fees').insert({
          id: `F${Date.now()}-${student.id}-${newId}`,
          student_id: student.id,
          amount: parseFloat(structureForm.amount),
          paid_amount: 0,
          due_date: structureForm.due_date,
          status: 'Pending',
          category: structureForm.category,
          payment_date: null,
        }).select();
      }
      fetchFeeStructure();
      // Refresh fees
      const { data: feesData } = await supabase.from('fees').select('*');
      if (feesData) setFees(feesData.map((f: Record<string, unknown>) => ({
        id: f.id as string, studentId: f.student_id as string, amount: f.amount as number,
        paidAmount: f.paid_amount as number, dueDate: f.due_date as string,
        status: f.status as Fee['status'], category: f.category as Fee['category'],
        paymentDate: f.payment_date as string | undefined,
      })));
    }
    setShowStructureModal(false);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Partial': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage fee structure and track payments</p>
        </div>
        <button
          onClick={() => setShowStructureModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Fee Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Fees', value: `₹${(totalAmount/1000).toFixed(0)}k`, icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Collected', value: `₹${(collectedAmount/1000).toFixed(0)}k`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending', value: `₹${(pendingAmount/1000).toFixed(0)}k`, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Paid', value: paidCount, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'payments' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          Fee Payments
        </button>
        <button onClick={() => setActiveTab('structure')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'structure' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          Fee Structure
        </button>
      </div>

      {activeTab === 'payments' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search student..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Classes</option>
                {['6th','7th','8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-2">{filteredFees.length} records found</p>
          </div>

          {/* Fees Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student', 'Class', 'Category', 'Total', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFees.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No fee records found</td></tr>
                ) : filteredFees.map(fee => {
                  const student = getStudent(fee.studentId);
                  const balance = fee.amount - fee.paidAmount;
                  return (
                    <tr key={fee.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {student?.name.charAt(0) || '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{student?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student?.class} {student?.section}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fee.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{fee.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-medium">₹{fee.paidAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">₹{balance.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{fee.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(fee.status)}`}>{fee.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {fee.status !== 'Paid' && (
                          <button onClick={() => { setSelectedFee(fee); setPayAmount(balance.toString()); setShowPayModal(true); }}
                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                            Record Payment
                          </button>
                        )}
                        {fee.status === 'Paid' && <span className="text-xs text-emerald-600 font-medium">✓ Paid on {fee.paymentDate}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'structure' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Class', 'Category', 'Amount', 'Due Date', 'Description', 'Academic Year'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feeStructure.map(fs => (
                <tr key={fs.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{fs.class}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{fs.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-indigo-600">₹{fs.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fs.due_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fs.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{fs.academic_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedFee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold text-gray-900">{getStudent(selectedFee.studentId)?.name}</p>
                <p className="text-sm text-gray-500 mt-2">Category: <span className="font-medium text-gray-700">{selectedFee.category}</span></p>
                <p className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">₹{selectedFee.amount.toLocaleString()}</span></p>
                <p className="text-sm text-gray-500">Already Paid: <span className="font-medium text-emerald-600">₹{selectedFee.paidAmount.toLocaleString()}</span></p>
                <p className="text-sm text-gray-500">Balance: <span className="font-medium text-red-600">₹{(selectedFee.amount - selectedFee.paidAmount).toLocaleString()}</span></p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount Received (₹)</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter amount" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Payment Date</label>
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleMarkPaid} disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Record Payment'}
                </button>
                <button onClick={() => setShowPayModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add Fee Category</h2>
              <button onClick={() => setShowStructureModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Class</label>
                <select value={structureForm.class} onChange={e => setStructureForm(p => ({...p, class: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  {['8th','9th','10th','11th','12th'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                <select value={structureForm.category} onChange={e => setStructureForm(p => ({...p, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  {['Tuition','Library','Exam','Sports','Transport','Lab','Hostel','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (₹)</label>
                <input type="number" value={structureForm.amount} onChange={e => setStructureForm(p => ({...p, amount: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Due Date</label>
                <input type="date" value={structureForm.due_date} onChange={e => setStructureForm(p => ({...p, due_date: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
                <input type="text" value={structureForm.description} onChange={e => setStructureForm(p => ({...p, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Annual tuition fee" />
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                ⚡ This will automatically generate fee records for all existing students in {structureForm.class} class.
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddStructure} disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add & Auto-assign'}
                </button>
                <button onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}