import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CreditCard, Dumbbell, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, DollarSign } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import { memberService, paymentService, trainerService, planService } from '../services/api';

const COLORS = ['#6574f3', '#f97316', '#10b981', '#f43f5e'];

const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 55000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 70000 },
  { month: 'May', revenue: 65000 },
  { month: 'Jun', revenue: 88000 },
  { month: 'Jul', revenue: 92000 },
];

const memberStatusData = [
  { name: 'Active', value: 68 },
  { name: 'Inactive', value: 15 },
  { name: 'Expired', value: 17 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-xl p-3 text-sm">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-primary-400 font-semibold">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, change, trend, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card card-hover"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
          ${trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}
        >
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-white">{value}</p>
        <p className="text-sm text-white/50">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, trainers: 0, plans: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, trainersRes, plansRes, revenueRes] = await Promise.allSettled([
          memberService.getStats(),
          trainerService.getAll(),
          planService.getAll(),
          paymentService.getStats(),
        ]);
        setStats({
          members: membersRes.value?.data?.total || 0,
          trainers: trainersRes.value?.data?.length || 0,
          plans: plansRes.value?.data?.length || 0,
          revenue: revenueRes.value?.data?.totalRevenue || 0,
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Members', value: stats.members || '—', change: '+12%', trend: 'up', color: 'bg-primary-500/15 text-primary-400' },
    { icon: UserCheck, label: 'Active Trainers', value: stats.trainers || '—', change: '+2', trend: 'up', color: 'bg-emerald-500/15 text-emerald-400' },
    { icon: Dumbbell, label: 'Active Plans', value: stats.plans || '—', change: '0%', trend: 'up', color: 'bg-violet-500/15 text-violet-400' },
    { icon: DollarSign, label: 'Total Revenue', value: stats.revenue ? `₹${(stats.revenue / 1000).toFixed(0)}K` : '—', change: '+18%', trend: 'up', color: 'bg-accent-500/15 text-accent-500' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening at your gym.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 flex flex-col justify-center h-[120px] bg-white/5 animate-pulse rounded-2xl border border-white/5">
              <div className="flex items-start justify-between mb-2">
                <div className="w-11 h-11 bg-white/10 rounded-xl" />
                <div className="w-12 h-5 bg-white/10 rounded-full" />
              </div>
              <div className="w-24 h-8 bg-white/10 rounded-md mt-2" />
            </div>
          ))
        ) : (
          statCards.map((s, i) => (
            <motion.div key={s.label} transition={{ delay: i * 0.05 }}>
              <StatCard {...s} />
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-white">Revenue Overview</h2>
              <p className="text-sm text-white/40 mt-0.5">Monthly revenue for 2024</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +18% this month
            </div>
          </div>
          {loading ? (
            <div className="w-full h-[220px] bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6574f3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6574f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6574f3" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Member Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="font-display font-semibold text-white mb-1">Member Status</h2>
          <p className="text-sm text-white/40 mb-4">Distribution by status</p>
          {loading ? (
            <div className="w-full h-[180px] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-white/5 animate-pulse" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={memberStatusData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {memberStatusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(val) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-primary-400" />
          <h2 className="font-display font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                </div>
                <div className="w-16 h-3 bg-white/5 rounded" />
              </div>
            ))
          ) : (
            [
              { action: 'New member registered', name: 'Rahul Sharma', time: '2 minutes ago', type: 'member' },
              { action: 'Payment received', name: 'Priya Patel', time: '15 minutes ago', type: 'payment' },
              { action: 'Plan updated', name: 'Pro Plan → ₹2,499', time: '1 hour ago', type: 'plan' },
              { action: 'Trainer added', name: 'Arjun Kumar', time: '3 hours ago', type: 'trainer' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${a.type === 'member' ? 'bg-primary-500/10 text-primary-400' :
                    a.type === 'payment' ? 'bg-emerald-500/10 text-emerald-400' :
                    a.type === 'plan' ? 'bg-violet-500/10 text-violet-400' :
                    'bg-accent-500/10 text-accent-500'}`}
                >
                  {a.type === 'member' ? <Users className="w-4 h-4" /> :
                   a.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                   a.type === 'plan' ? <Dumbbell className="w-4 h-4" /> :
                   <UserCheck className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/80">{a.action}</p>
                  <p className="text-xs text-white/40">{a.name}</p>
                </div>
                <p className="text-xs text-white/30">{a.time}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
