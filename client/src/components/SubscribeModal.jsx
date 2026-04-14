import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Phone, Calendar, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { planService, subscriptionService } from '../services/api';
import useAuthStore from '../context/useAuthStore';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '6:00 AM - 7:00 AM',
  '7:00 AM - 8:00 AM',
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '5:00 PM - 6:00 PM',
  '6:00 PM - 7:00 PM',
  '7:00 PM - 8:00 PM',
  '8:00 PM - 9:00 PM',
];

export default function SubscribeModal({ isOpen, onClose, defaultPlanId, onSuccess }) {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    planId: defaultPlanId || '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  useEffect(() => {
    planService.getAll().then(r => setPlans(r.data || [])).catch(() => {});
  }, []);

  // Sync defaultPlanId when it changes
  useEffect(() => {
    if (defaultPlanId) setForm(f => ({ ...f, planId: defaultPlanId }));
  }, [defaultPlanId]);

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.planId)          return toast.error('Please select a plan');
    if (!form.phone)           return toast.error('Phone number is required');
    if (!form.preferredDate)   return toast.error('Please choose a preferred date');
    if (!form.preferredTime)   return toast.error('Please choose a preferred time slot');

    setSubmitting(true);
    try {
      await subscriptionService.createRequest(form);
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ planId: defaultPlanId || '', phone: '', preferredDate: '', preferredTime: '', message: '' });
    onClose();
  };

  const selectedPlan = plans.find(p => p._id === form.planId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="card w-full max-w-md max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-white">Subscribe to Plan</h2>
                  <p className="text-xs text-white/40 mt-0.5">Offline enrollment request</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">Request Submitted!</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-2">
                  Your subscription request has been sent to the admin for review.
                </p>
                <div className="w-full mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
                  📍 Please visit the gym on your preferred date &amp; time to complete payment.
                </div>
                {selectedPlan && (
                  <div className="w-full mt-3 p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between text-sm">
                    <span className="text-white/50">Plan selected</span>
                    <span className="font-semibold text-white">{selectedPlan.name} — ₹{selectedPlan.price?.toLocaleString()}</span>
                  </div>
                )}
                <button
                  onClick={handleClose}
                  className="mt-6 w-full px-4 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              /* Form State */
              <div className="p-6 space-y-4">
                {/* Auto-filled name */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/60 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Plan selector */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">
                    Membership Plan <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select
                      value={form.planId}
                      onChange={e => handleChange('planId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-dark-800">Select a plan…</option>
                      {plans.map(p => (
                        <option key={p._id} value={p._id} className="bg-dark-800">
                          {p.name} — ₹{p.price?.toLocaleString()} / {p.duration} mo
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedPlan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-300"
                    >
                      <span>{selectedPlan.duration} month{selectedPlan.duration > 1 ? 's' : ''} membership</span>
                      <span className="font-bold">₹{selectedPlan.price?.toLocaleString()}</span>
                    </motion.div>
                  )}
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">
                    Preferred Visit Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="date"
                      min={minDate}
                      value={form.preferredDate}
                      onChange={e => handleChange('preferredDate', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">
                    Preferred Time Slot <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select
                      value={form.preferredTime}
                      onChange={e => handleChange('preferredTime', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
                    >
                      <option value="" className="bg-dark-800">Choose a time slot…</option>
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t} className="bg-dark-800">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Message (optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                    <textarea
                      rows={3}
                      placeholder="Any special requests or questions for the gym staff…"
                      value={form.message}
                      onChange={e => handleChange('message', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pl-9 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Info note */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
                  💡 After admin approval, please visit the gym on your preferred date with the plan amount in cash to complete enrollment.
                </div>
              </div>
            )}

            {/* Footer */}
            {!submitted && (
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all disabled:opacity-60"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />}
                  Send Request
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
