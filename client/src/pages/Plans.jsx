import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, CheckCircle2, Edit, Trash2, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { planService } from '../services/api';
import useAuthStore from '../context/useAuthStore';
import PlanModal from '../components/PlanModal';
import toast from 'react-hot-toast';

const planColors = [
  'from-slate-500 to-slate-600',
  'from-primary-500 to-accent-500',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
];

export default function Plans() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await planService.getAll();
      setPlans(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    try { 
      await planService.delete(id); 
      toast.success('Plan deleted successfully');
      fetchPlans(); 
    } catch { toast.error('Failed to delete plan') }
  };

  const toggleStatus = async (plan) => {
    try {
      await planService.update(plan._id, { status: plan.status === 'active' ? 'inactive' : 'active' });
      toast.success(`Plan ${plan.status === 'active' ? 'deactivated' : 'activated'}!`);
      fetchPlans();
    } catch { toast.error('Failed to update status') }
  };

  const openAddModal = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => fetchPlans();

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">{isAdmin ? 'Membership Plans' : 'Explore Plans'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Create and manage gym membership plans.' : 'Browse our options and choose the perfect plan for you.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/40">
          <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-white/30">
          <Dumbbell className="w-14 h-14 mb-3 opacity-30" />
          <p className="font-medium">No plans yet</p>
          <p className="text-sm mt-1">Create your first membership plan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`card p-6 relative ${plan.status === 'inactive' ? 'opacity-60' : ''}`}
            >
              {/* Top gradient strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${planColors[i % planColors.length]}`} />

              <div className="flex items-start justify-between mb-4 mt-2">
                <div>
                  <h3 className={`font-display font-bold text-lg bg-gradient-to-r ${planColors[i % planColors.length]} bg-clip-text text-transparent`}>
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-bold text-white mt-1">
                    ₹{plan.price?.toLocaleString()}
                    <span className="text-sm font-normal text-white/40 ml-1">/{plan.duration} mo</span>
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => toggleStatus(plan)} className="text-white/40 hover:text-white transition-colors">
                    {plan.status === 'active'
                      ? <ToggleRight className="w-7 h-7 text-emerald-400" />
                      : <ToggleLeft className="w-7 h-7" />
                    }
                  </button>
                )}
              </div>

              {plan.description && (
                <p className="text-sm text-white/40 mb-4 leading-relaxed">{plan.description}</p>
              )}

              {plan.features?.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2 mt-auto pt-4 border-t border-white/5 items-center">
                <span className={plan.status === 'active' ? 'badge-active' : 'badge-inactive'}>{plan.status}</span>
                <div className="flex gap-1 ml-auto">
                  {isAdmin ? (
                    <>
                      <button onClick={() => openEditModal(plan)} className="p-2 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(plan._id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5">
                      Subscribe <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  );
}
