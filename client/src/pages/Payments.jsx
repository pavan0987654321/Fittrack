import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Search, Filter, Trash2, Edit, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { paymentService } from '../services/api';
import PaymentModal from '../components/PaymentModal';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = {
    paid: 'badge-paid',
    pending: 'badge-pending',
    overdue: 'badge-inactive',
    refunded: 'badge-inactive',
  };
  return map[status] || 'badge-pending';
};

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-xl p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-primary-400 font-semibold">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        paymentService.getAll({ status: filter }),
        paymentService.getStats(),
      ]);
      setPayments(pRes.data.payments || []);
      setStats(sRes.data || {});
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      await paymentService.delete(id);
      toast.success('Payment deleted successfully');
      fetch();
    } catch { toast.error('Failed to delete payment'); }
  };

  const openAddModal = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => fetch();

  // Format monthly revenue for chart
  const chartData = (stats.monthlyRevenue || [])
    .slice().reverse()
    .map((m) => ({
      month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
      revenue: m.revenue,
    }));

  return (
    <DashboardLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track revenue, dues, and payment history.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: DollarSign, label: 'Total Revenue', value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`, color: 'text-emerald-400 bg-emerald-500/10' },
          { icon: CreditCard, label: 'Paid', value: stats.paid || 0, color: 'text-primary-400 bg-primary-500/10' },
          { icon: Clock, label: 'Pending', value: stats.pending || 0, color: 'text-amber-400 bg-amber-500/10' },
          { icon: AlertTriangle, label: 'Overdue', value: stats.overdue || 0, color: 'text-red-400 bg-red-500/10' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h2 className="font-display font-semibold text-white">Monthly Revenue</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="revenue" fill="#6574f3" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto min-w-40">
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-white/40">
            <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/30">
            <CreditCard className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No payments found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Member', 'Amount', 'Method', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-white/40 px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white">{p.memberId?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-white/50 capitalize">{p.paymentMethod}</td>
                  <td className="px-4 py-3 text-sm text-white/50">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadge(p.status)}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(p)} className="p-2 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
        onSuccess={handleModalSuccess}
      />
    </DashboardLayout>
  );
}
