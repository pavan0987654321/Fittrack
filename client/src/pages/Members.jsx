import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Trash2, Edit, Phone, Mail, Calendar, MoreVertical } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { memberService } from '../services/api';
import MemberModal from '../components/MemberModal';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = { active: 'badge-active', inactive: 'badge-inactive', expired: 'badge-pending' };
  return map[status] || 'badge-inactive';
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await memberService.getAll({ search, status: filter });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await memberService.getStats();
      setStats(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [search, filter]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await memberService.delete(id);
      toast.success('Member deleted successfully');
      fetchMembers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const openAddModal = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchMembers();
    fetchStats();
  };

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">Manage all gym members and their subscriptions.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-white' },
          { label: 'Active', value: stats.active || 0, color: 'text-emerald-400' },
          { label: 'Inactive', value: stats.inactive || 0, color: 'text-red-400' },
          { label: 'Expired', value: stats.expired || 0, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto min-w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-48 text-white/40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
              <p className="text-sm">Loading members...</p>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/30">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No members found</p>
            <p className="text-sm mt-1">Add your first member to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5">
                {['Member', 'Contact', 'Plan', 'Expiry', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <motion.tr
                  key={m._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-sm font-bold text-white">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{m.name}</p>
                        <p className="text-xs text-white/40">#{m._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-white/50"><Mail className="w-3 h-3" /> {m.email}</div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50"><Phone className="w-3 h-3" /> {m.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{m.membershipPlan?.name || 'No plan'}</td>
                  <td className="px-4 py-3">
                    {m.expiryDate ? (
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusBadge(m.status)}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(m)} className="p-2 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </motion.div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  );
}
