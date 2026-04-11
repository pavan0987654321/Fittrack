import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, IndianRupee, Calendar, CreditCard, AlignLeft, Loader2 } from 'lucide-react';
import { paymentService, memberService } from '../services/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, payment = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    date: '',
    status: 'paid',
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      try {
        const res = await memberService.getAll();
        setMembers(res.data.members || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };
    fetchMembers();
  }, [isOpen]);

  // Populate form for editing
  useEffect(() => {
    if (payment && isOpen) {
      setForm({
        memberId: payment.memberId?._id || payment.memberId || '',
        amount: payment.amount || '',
        date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: payment.status || 'paid',
        paymentMethod: payment.paymentMethod || 'cash',
        notes: payment.notes || '',
      });
    } else {
      setForm({
        memberId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'cash',
        notes: '',
      });
    }
  }, [payment, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        memberId: form.memberId || null,
      };

      if (!payload.memberId) {
        toast.error("Please select a member.");
        setLoading(false);
        return;
      }

      if (payment) {
        await paymentService.update(payment._id, payload);
        toast.success('Payment updated successfully!');
      } else {
        await paymentService.create(payload);
        toast.success('Payment recorded successfully!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-dark-850 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-display font-bold text-white">
              {payment ? 'Edit Payment' : 'Record Payment'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Member */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Member *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                  <select
                    name="memberId"
                    required
                    value={form.memberId}
                    onChange={handleChange}
                    className="input pl-10 appearance-none cursor-pointer"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  >
                    <option value="" disabled style={{ background: '#0f172a' }}>Select Member</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id} style={{ background: '#0f172a' }}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    required
                    value={form.amount}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., 2999"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Payment Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={handleChange}
                    className="input pl-10"
                    style={{ backgroundColor: '#0f172a', color: '#fff', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input cursor-pointer"
                  style={{ backgroundColor: '#0f172a', color: '#fff' }}
                >
                  <option value="paid" style={{ background: '#0f172a' }}>Paid</option>
                  <option value="pending" style={{ background: '#0f172a' }}>Pending</option>
                  <option value="overdue" style={{ background: '#0f172a' }}>Overdue</option>
                  <option value="refunded" style={{ background: '#0f172a' }}>Refunded</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="input pl-10 appearance-none cursor-pointer"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  >
                    <option value="cash" style={{ background: '#0f172a' }}>Cash</option>
                    <option value="card" style={{ background: '#0f172a' }}>Card</option>
                    <option value="upi" style={{ background: '#0f172a' }}>UPI</option>
                    <option value="bank_transfer" style={{ background: '#0f172a' }}>Bank Transfer</option>
                    <option value="other" style={{ background: '#0f172a' }}>Other</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notes</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="input pl-10 py-2 min-h-[60px]"
                    placeholder="Optional details..."
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-5 py-2.5"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 px-6 py-2.5"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Payment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
