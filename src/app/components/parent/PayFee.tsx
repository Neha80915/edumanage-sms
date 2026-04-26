import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { DollarSign, CheckCircle, Clock, AlertTriangle, Calendar, Download, Send, CreditCard, Building, Smartphone } from 'lucide-react';

export function PayFee() {
  const { currentUser, students, parents, fees, setFees } = useApp();
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [showChallan, setShowChallan] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const parent = parents.find(p => p.id === currentUser?.id);
  const children = parent ? students.filter(s => parent.children.includes(s.id)) : [];
  const child = children[0];

  const childFees = child ? fees.filter(f => f.studentId === child.id && f.status !== 'Paid') : [];
  const selectedFeeObjects = childFees.filter(f => selectedFees.includes(f.id));
  const totalSelected = selectedFeeObjects.reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);

  const toggleFee = (feeId: string) => {
    setSelectedFees(prev => prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]);
  };

  const handleSubmitPayment = async () => {
    if (!transactionId || selectedFees.length === 0) return;
    setSubmitting(true);

    // Save payment request to Supabase
    for (const feeId of selectedFees) {
      await supabase.from('fees').update({
        status: 'Partial',
        remarks: `Payment pending verification. Transaction ID: ${transactionId}`,
      }).eq('id', feeId);
    }

    setSubmitting(false);
    setSubmitted(true);
    setShowUPI(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'text-emerald-600 bg-emerald-50';
      case 'Pending': return 'text-amber-600 bg-amber-50';
      case 'Overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!child) return <div className="p-8 text-center text-gray-400">No children linked to your account</div>;

  if (submitted) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Payment Submitted!</h2>
      <p className="text-gray-500 max-w-sm">Your payment details have been submitted. The admin will verify and confirm your payment within 24 hours.</p>
      <p className="text-sm text-gray-400">Transaction ID: <span className="font-mono font-semibold text-gray-700">{transactionId}</span></p>
      <button onClick={() => { setSubmitted(false); setSelectedFees([]); setTransactionId(''); }}
        className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
        Back to Fees
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pay Fees</h1>
        <p className="text-gray-500 text-sm mt-0.5">Select fees to pay for {child.name}</p>
      </div>

      {/* Child info */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold">{child.name.charAt(0)}</div>
        <div>
          <p className="font-bold">{child.name}</p>
          <p className="text-white/80 text-sm">Class {child.class} {child.section} · Roll No: {child.rollNumber}</p>
        </div>
      </div>

      {childFees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">All fees paid!</h3>
          <p className="text-gray-400 text-sm mt-1">No pending fees for {child.name}</p>
        </div>
      ) : (
        <>
          {/* Select fees */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Select Fees to Pay</h2>
              <button onClick={() => setSelectedFees(childFees.map(f => f.id))}
                className="text-xs text-indigo-600 hover:underline">Select All</button>
            </div>

            {childFees.map(fee => {
              const balance = fee.amount - fee.paidAmount;
              const isSelected = selectedFees.includes(fee.id);
              return (
                <div key={fee.id}
                  onClick={() => toggleFee(fee.id)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{fee.category} Fee</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(fee.status)}`}>{fee.status}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due: {fee.dueDate}
                        </span>
                        <span className="text-sm font-bold text-red-600">₹{balance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total and pay button */}
          {selectedFees.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky bottom-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">{selectedFees.length} fee(s) selected</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalSelected.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Amount Due</p>
                </div>
              </div>

              {/* Payment options */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowChallan(true)}
                  className="flex items-center justify-center gap-2 py-2.5 border border-indigo-200 text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition text-sm font-medium">
                  <Download className="w-4 h-4" /> Generate Challan
                </button>
                <button onClick={() => setShowUPI(true)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
                  <Smartphone className="w-4 h-4" /> Pay via UPI
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Challan Modal */}
      {showChallan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-indigo-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-lg font-bold">Payment Challan</h2>
              <p className="text-indigo-200 text-sm">EduManage School · Academic Year 2025-26</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Student Name</span><span className="font-medium">{child.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Class</span><span className="font-medium">{child.class} {child.section}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Roll No</span><span className="font-medium">{child.rollNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500">Category</th>
                      <th className="px-3 py-2 text-right text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFeeObjects.map(fee => (
                      <tr key={fee.id} className="border-t border-gray-50">
                        <td className="px-3 py-2 text-gray-700">{fee.category} Fee</td>
                        <td className="px-3 py-2 text-right font-medium">₹{(fee.amount - fee.paidAmount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-50 border-t-2 border-indigo-100">
                    <tr>
                      <td className="px-3 py-2 font-bold text-indigo-900">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-indigo-900">₹{totalSelected.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-semibold mb-1">Payment Instructions:</p>
                <p>1. Pay at school admin office with this challan</p>
                <p>2. Or transfer to: <span className="font-mono font-bold">HDFC Bank · A/C: 1234567890 · IFSC: HDFC0001234</span></p>
                <p>3. Mention student name & roll number in remarks</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
                  Print Challan
                </button>
                <button onClick={() => setShowChallan(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showUPI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Pay via UPI</h2>
            <p className="text-gray-500 text-sm mb-5">Total Amount: <span className="font-bold text-indigo-600">₹{totalSelected.toLocaleString()}</span></p>

            <div className="bg-gray-50 rounded-xl p-4 text-center mb-5">
              <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-xl mx-auto flex items-center justify-center mb-3">
                <div className="text-center">
                  <Smartphone className="w-8 h-8 text-indigo-500 mx-auto" />
                  <p className="text-xs text-gray-400 mt-1">QR Code</p>
                </div>
              </div>
              <p className="text-sm font-mono font-bold text-gray-900">school@upi</p>
              <p className="text-xs text-gray-500 mt-1">Scan with any UPI app</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">UPI ID</p>
                  <p className="text-xs font-mono text-gray-600">school@upi</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-xs font-mono text-gray-600">HDFC · 1234567890 · HDFC0001234</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Enter Transaction ID after payment</label>
              <input type="text" value={transactionId} onChange={e => setTransactionId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. UPI123456789 or NEFT12345" />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmitPayment} disabled={!transactionId || submitting}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
              <button onClick={() => setShowUPI(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}