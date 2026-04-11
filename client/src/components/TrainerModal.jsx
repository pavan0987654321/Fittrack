import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Award, Loader2 } from 'lucide-react';
import { trainerService } from '../services/api';
import toast from 'react-hot-toast';

export default function TrainerModal({ isOpen, onClose, trainer = null, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    status: 'active',
  });

  // Populate form for editing
  useEffect(() => {
    if (trainer && isOpen) {
      setForm({
        name: trainer.name || '',
        email: trainer.email || '',
        phone: trainer.phone || '',
        specialty: trainer.specialty || '',
        experience: trainer.experience || '',
        status: trainer.status || 'active',
      });
    } else {
      setForm({
        name: '', email: '', phone: '', specialty: '', experience: '', status: 'active'
      });
    }
  }, [trainer, isOpen]);

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
        experience: Number(form.experience) || 0,
      };

      if (trainer) {
        await trainerService.update(trainer._id, payload);
        toast.success('Trainer updated successfully!');
      } else {
        await trainerService.create(payload);
        toast.success('New trainer added successfully!');
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
              {trainer ? 'Edit Trainer' : 'Add New Trainer'}
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
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., Arjun Kumar"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., arjun@fittrack.com"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., +91 9876543210"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Specialty *</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="specialty"
                    type="text"
                    required
                    value={form.specialty}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="e.g., Weight Training, Yoga, HIIT"
                    style={{ backgroundColor: '#0f172a', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Experience (Years)</label>
                <input
                  name="experience"
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 5"
                  style={{ backgroundColor: '#0f172a', color: '#fff' }}
                />
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
                  <option value="active" style={{ background: '#0f172a' }}>Active</option>
                  <option value="inactive" style={{ background: '#0f172a' }}>Inactive</option>
                </select>
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
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Trainer'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
