import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, Dumbbell, UserCheck, Loader2 } from 'lucide-react';
import { planService, trainerService, memberService } from '../services/api';
import toast from 'react-hot-toast';

export default function MemberModal({ isOpen, onClose, member = null, onSuccess }) {
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    membershipPlan: '',
    trainerAssigned: '',
    status: 'active',
    expiryDate: '',
  });

  // Fetch dropdown data
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const [plansRes, trainersRes] = await Promise.all([
          planService.getAll(),
          trainerService.getAll()
        ]);
        setPlans(plansRes.data || []);
        // Note: trainers is returned as array from trainer API usually, based on similar setup
        setTrainers(trainersRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchData();
  }, [isOpen]);

  // Populate form for editing
  useEffect(() => {
    if (member && isOpen) {
      setForm({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        membershipPlan: member.membershipPlan?._id || member.membershipPlan || '',
        trainerAssigned: member.trainerAssigned?._id || member.trainerAssigned || '',
        status: member.status || 'active',
        expiryDate: member.expiryDate ? new Date(member.expiryDate).toISOString().split('T')[0] : '',
      });
    } else {
      setForm({
        name: '', email: '', phone: '', membershipPlan: '', trainerAssigned: '', status: 'active', expiryDate: ''
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate expiryDate if a membership plan is selected
    if (name === 'membershipPlan' && value) {
      const selectedPlan = plans.find(p => p._id === value);
      if (selectedPlan && selectedPlan.duration) {
        const date = new Date();
        date.setMonth(date.getMonth() + selectedPlan.duration);
        
        setForm(prev => ({ 
          ...prev, 
          [name]: value,
          expiryDate: date.toISOString().split('T')[0] // Format to YYYY-MM-DD
        }));
        toast.success(`Expiry autocalculated to ${selectedPlan.duration} months from today.`);
        return;
      }
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        membershipPlan: form.membershipPlan || null,
        trainerAssigned: form.trainerAssigned || null,
        expiryDate: form.expiryDate || null,
      };

      if (member) {
        await memberService.update(member._id, payload);
        toast.success('Member updated successfully!');
      } else {
        await memberService.create(payload);
        toast.success('New member added successfully!');
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
          className="relative w-full max-w-xl bg-dark-850 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-display font-bold text-white">
              {member ? 'Edit Member' : 'Add New Member'}
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
                    placeholder="John Doe"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="john@example.com"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="+91 9876543210"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                  />
                </div>
              </div>

              {/* Plan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Membership Plan</label>
                <div className="relative">
                  <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                  <select
                    name="membershipPlan"
                    value={form.membershipPlan}
                    onChange={handleChange}
                    className="input pl-10 appearance-none cursor-pointer"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                  >
                    <option value="" style={{ background: '#0f172a' }}>No Plan Selected</option>
                    {Array.isArray(plans) && plans.map(p => (
                      <option key={p._id} value={p._id} style={{ background: '#0f172a' }}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
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
                  style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                >
                  <option value="active" style={{ background: '#0f172a' }}>Active</option>
                  <option value="inactive" style={{ background: '#0f172a' }}>Inactive</option>
                  <option value="expired" style={{ background: '#0f172a' }}>Expired</option>
                </select>
              </div>

              {/* Trainer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Assigned Trainer</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                  <select
                    name="trainerAssigned"
                    value={form.trainerAssigned}
                    onChange={handleChange}
                    className="input pl-10 appearance-none cursor-pointer"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff' }}
                  >
                    <option value="" style={{ background: '#0f172a' }}>No Trainer</option>
                    {Array.isArray(trainers) && trainers.map(t => (
                      <option key={t._id} value={t._id} style={{ background: '#0f172a' }}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                  <input
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="input pl-10"
                    style={{ backgroundColor: '#0f172a', color: '#fff', WebkitTextFillColor: '#fff', colorScheme: 'dark' }}
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
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Member'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
