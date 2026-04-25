import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, CreditCard, CheckCircle, AlertCircle, X, Search } from 'lucide-react';

export function PayFee() {
  const { currentUser, fees, updateFee } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [formData, setFormData] = useState({
    paidAmount: '',
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'UPI' | 'Cheque',
    transactionId: '',
    notes: '',
  });

  // Filter fees for parent's children
  // Get parent's children from mock data (since context doesn't have students for parent)
  const mockParents = [
    { id: 'P001', children: ['S001'] },
    { id: 'P002', children: ['S002'] },
    { id: 'P003', children: ['S003'] },
  ];
  const currentParent = mockParents.find(p => p.id === currentUser?.id);
  const parentChildren = currentParent ? currentParent.children : [];

  const parentFees = fees.filter(fee => parentChildren.includes(fee.studentId));

  const filteredFees = parentFees.filter(fee =>
    fee.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePay = (fee: any) => {
    setEditingFee(fee);
    setFormData({
      paidAmount: '',
      paymentMethod: 'Cash',
      transactionId: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee || !formData.paidAmount) return;

    const totalPaid = (editingFee.paidAmount || 0) + parseFloat(formData.paidAmount);
    const newStatus = totalPaid >= editingFee.amount ? 'Paid' : 'Partial';

    const updatedFee = {
      ...editingFee,
      paidAmount: totalPaid,
      status: newStatus,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      notes: formData.notes,
    };

    updateFee(updatedFee);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Pay Fees</h1>
          <p className="text-gray-600">View and pay outstanding fees for your children</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category, status, or student ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.map(fee => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{fee.studentId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{fee.category}</td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-gray-900">₹{fee.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{(fee.paidAmount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      fee.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      fee.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {fee.status === 'Paid' ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePay(fee)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 font-medium"
                      >
                        <DollarSign className="w-4 h-4" /> Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No fees found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Pay Fee</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Category:</strong> {editingFee?.category} | 
                  <strong> Remaining:</strong> ₹{(editingFee?.amount - (editingFee?.paidAmount || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max={editingFee?.amount - (editingFee?.paidAmount || 0)}
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                <select
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter transaction ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Make Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
    </div>
  );
}
