import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Plus, Star, Phone, Mail, Trash2, Edit, Users } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { trainerService } from '../services/api';
import TrainerModal from '../components/TrainerModal';
import toast from 'react-hot-toast';

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getAll();
      setTrainers(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trainer?')) return;
    try { 
      await trainerService.delete(id); 
      toast.success('Trainer deleted successfully');
      fetchTrainers(); 
    } catch { toast.error('Failed to delete trainer'); }
  };

  const openAddModal = () => {
    setSelectedTrainer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => fetchTrainers();

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Trainers</h1>
          <p className="page-subtitle">Manage your certified fitness trainers.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Trainer
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/40">
          <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-white/30">
          <UserCheck className="w-14 h-14 mb-3 opacity-30" />
          <p className="font-medium">No trainers yet</p>
          <p className="text-sm mt-1">Add your first trainer to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {trainers.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-lg font-bold text-emerald-300">
                    {t.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.specialty}</p>
                  </div>
                </div>
                <span className={t.status === 'active' ? 'badge-active' : 'badge-inactive'}>{t.status}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Mail className="w-3.5 h-3.5" /> {t.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Phone className="w-3.5 h-3.5" /> {t.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Users className="w-3.5 h-3.5" /> {t.assignedMembers?.length || 0} members
                </div>
              </div>

              {t.rating > 0 && (
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`w-3.5 h-3.5 ${idx < t.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                  ))}
                  <span className="text-xs text-white/40 ml-1">{t.rating}/5</span>
                </div>
              )}

              {/* View Assigned Members */}
              {t.assignedMembers && t.assignedMembers.length > 0 && (
                <div className="mb-4 pt-3 border-t border-white/5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Assigned Trainees</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.assignedMembers.map(m => (
                      <span key={m._id} className="text-xs px-2 py-1 bg-white/5 text-white/60 border border-white/10 rounded-md">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
                <button onClick={() => openEditModal(t)} className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(t._id)} className="btn-danger text-xs py-2 px-3 flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <TrainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trainer={selectedTrainer}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  );
}
