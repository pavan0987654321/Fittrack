import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserMinus, DollarSign, Activity, TrendingUp, Calendar,
  ArrowUpRight, ArrowDownRight, Clock, Check, Bell, UserCheck, ChevronDown, X
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import { analyticsService, subscriptionService } from '../services/api';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6574f3', '#10b981', '#f43f5e', '#f97316', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-white font-semibold">
          {prefix}{payload[0].value.toLocaleString()}{suffix}
        </p>
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, color, info }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 lg:p-6 card-hover relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {info && (
          <div className="bg-dark-900/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-xs font-medium text-white/70 shadow-sm">
            {info}
          </div>
        )}
      </div>
      <div className="mt-4 relative z-10">
        <p className="text-3xl font-display font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-white/50 font-medium mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30days');
  const [subRequests, setSubRequests] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  const fetchAnalytics = async (tf) => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboard({ timeframe: tf });
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setSubLoading(true);
    try {
      const res = await subscriptionService.getAll({ status: 'pending' });
      setSubRequests(res.data.requests || []);
    } catch {}
    finally { setSubLoading(false); }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
    fetchSubscriptions();
  }, [timeframe]);

  const handleApprove = async (id) => {
    try {
      await subscriptionService.approve(id);
      toast.success('Request approved! Plan activated.');
      fetchSubscriptions();
      fetchAnalytics(timeframe); // fresh data after approval
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to reject this request?')) return;
      await subscriptionService.reject(id, { reason: 'Admin rejected' });
      toast.success('Request rejected.');
      fetchSubscriptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };



  const metrics = data?.metrics || {};
  const charts = data?.charts || { planDistribution: [], revenueTrend: [], attendanceTrend: [] };
  const panels = data?.panels || { recentMembers: [], recentActivity: [] };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Premium insights and business overview.</p>
        </div>
        
        {/* Timeframe Filter */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: '6months', label: '6 Months' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={Users} 
              label="Active Members" 
              value={metrics.activeMembers || 0} 
              color="bg-emerald-500/20 text-emerald-400" 
              info="Healthy"
            />
            <StatCard 
              icon={UserMinus} 
              label="Inactive Members" 
              value={metrics.inactiveMembers || 0} 
              color="bg-red-500/20 text-red-400"
              info="Needs Attention"
            />
            <StatCard 
              icon={Activity} 
              label="Attendance Rate" 
              value={`${metrics.attendanceRate || 0}%`} 
              color="bg-violet-500/20 text-violet-400"
              info={timeframe}
            />
            <StatCard 
              icon={DollarSign} 
              label="Total Revenue" 
              value={`₹${(metrics.totalRevenue || 0).toLocaleString()}`} 
              color="bg-primary-500/20 text-primary-400"
              info={timeframe}
            />
          </div>

          {/* Charts Row 1: Line & Pie */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend (Area Chart) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-semibold text-white">Revenue Trend</h2>
                  <p className="text-sm text-white/40">Monthly revenue history</p>
                </div>
              </div>
              <div className="h-72">
                {charts.revenueTrend.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white/20">No revenue data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6574f3" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6574f3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                      <YAxis hide domain={['dataMin - 1000', 'dataMax + 5000']} />
                      <Tooltip content={<CustomTooltip prefix="₹" />} />
                      <Area type="monotone" dataKey="revenue" stroke="#6574f3" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Plan Distribution (Pie Chart) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="mb-4">
                <h2 className="font-display font-semibold text-white">Plan Distribution</h2>
                <p className="text-sm text-white/40">Active members per plan</p>
              </div>
              <div className="h-72 flex items-center justify-center">
                {charts.planDistribution.length === 0 ? (
                  <div className="text-white/20">No active plans</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.planDistribution}
                        cx="50%" cy="45%"
                        innerRadius={60} outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip suffix=" members" />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span className="text-sm text-white/60">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Charts Row 2 & Activities */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            
            {/* Attendance Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 lg:col-span-2">
              <div className="mb-6">
                <h2 className="font-display font-semibold text-white">Attendance Activity</h2>
                <p className="text-sm text-white/40">Daily check-ins ({timeframe})</p>
              </div>
              <div className="h-64">
                {charts.attendanceTrend.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-white/20">No attendance data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} minTickGap={20} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip suffix=" presents" />} />
                      <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Member Activity Panel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card flex flex-col">
              <div className="p-6 border-b border-white/5 shrink-0">
                <h2 className="font-display font-semibold text-white">Recent Joiners</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2 min-h-[256px]">
                {panels.recentMembers.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/20 text-sm">No recent joins</div>
                ) : (
                  panels.recentMembers.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold">
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{m.name}</p>
                        <p className="text-[10px] text-white/40">Joined {new Date(m.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>

          {/* Subscription Requests */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-white">Pending Requests</h2>
                  <p className="text-sm text-white/40">Approve offline plan subscriptions</p>
                </div>
              </div>
            </div>
            
            {subLoading ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
            ) : subRequests.length === 0 ? (
              <div className="py-16 text-center">
                <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
                <p className="text-white/40 font-medium">No pending requests right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {subRequests.map(req => (
                  <div key={req._id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                    <div className="grid sm:grid-cols-2 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-white/40 mb-1">MEMBER</p>
                        <p className="font-medium text-white">{req.name}</p>
                        <p className="text-sm text-white/60">{req.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">PLAN & TIMING</p>
                        <p className="font-medium text-primary-400">{req.planId?.name || 'Unknown Plan'}</p>
                        <p className="text-sm text-white/60">
                          {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '—'} at {req.preferredTime || '—'}
                        </p>
                      </div>
                    </div>
                    {req.message && (
                      <div className="flex-1 bg-dark-900/50 p-3 rounded-lg border border-white/5">
                        <p className="text-xs text-white/40 mb-1">MESSAGE</p>
                        <p className="text-sm text-white/70 italic">&quot;{req.message}&quot;</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleApprove(req._id)} className="btn-primary py-2 px-6 flex-1 lg:flex-none">
                        Approve & Activate
                      </button>
                      <button onClick={() => handleReject(req._id)} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </DashboardLayout>
  );
}
