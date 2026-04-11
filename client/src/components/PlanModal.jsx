import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, IndianRupee, Calendar, CheckCircle2, Loader2, AlignLeft } from 'lucide-react';
import { planService } from '../services/api';
import toast from 'react-hot-toast';

export default function PlanModal({ isOpen, onClose, plan = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    duration: '',
    status: 'active',
    description: '',
    features: '', // We'll handle this as simple comma-separated input
  });

  // Populate form for editing
  useEffect(() => {
    if (plan && isOpen) {
      setForm({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || '',
        status: plan.status || 'active',
        description: plan.description || '',
        features: plan.features ? plan.features.join(', ') : '',
      });
    } else {
      setForm({
        name: '', price: '', duration: '', status: 'active', description: '', features: ''
      });
    }
  }, [plan, isOpen]);

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
        price: Number(form.price),
        duration: Number(form.duration),
        // Convert comma-separated string to array
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      };

      if (plan) {
        await planService.update(plan._id, payload);
        toast.success('Plan updated successfully!');
      } else {
        await planService.create(payload);
        toast.success('New plan added successfully!');
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
              {plan ? 'Edit Plan' : 'Add New Plan'}
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
              
              {/* Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Plan Name *</label>
                <div className="relative">
                  <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., Premium Pro"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Price (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="price"
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., 2999"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Duration (Months) *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    required
                    value={form.duration}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., 3"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input cursor-pointer"
                  style={{ backgroundColor: '#0f172a', color: '#fff' }}
                >
                  <option value="active" style={{ background: '#0f172a' }}>Active</option>
                  <option value="inactive" style={{ background: '#0f172a' }}>Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="input pl-10 py-2 min-h-[80px]"
                    placeholder="Short description of the plan..."
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Features</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                  <textarea
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    className="input pl-10 py-2 min-h-[80px]"
                    placeholder="Yoga, Spa Access, Priority Trainer... (comma separated)"
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
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Plan'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
