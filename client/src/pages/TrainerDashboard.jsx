import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Phone, Mail, Calendar, UserCheck,
  TrendingUp, Scale, Ruler, ChevronDown, ChevronUp, Target,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../context/useAuthStore';
import { memberService, progressService } from '../services/api';

// ── BMI helper ─────────────────────────────────────────────────────────────────
function getBMICategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' };
  return                 { label: 'Obese',        color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' };
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-sm font-bold text-primary-400">{payload[0].value} kg</p>
    </div>
  );
}

// ── Mini progress chart  ───────────────────────────────────────────────────────
function MiniProgressChart({ memberId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    progressService.getByMember(memberId)
      .then(r => setData(r.data || []))
      .catch(() => setData([]));
  }, [memberId]);

  if (data === null) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-5 h-5 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <p className="text-xs text-white/30 text-center py-3">No progress data yet</p>
    );
  }

  const chartData = data.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: p.weight,
  }));

  const trend = data[data.length - 1].weight - data[0].weight;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40">Weight Trend</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend < 0 ? 'text-emerald-400' : trend > 0 ? 'text-red-400' : 'text-white/40'}`}>
          {trend < 0 ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)} kg
        </span>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${memberId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={1.5} fill={`url(#grad-${memberId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Member Card ────────────────────────────────────────────────────────────────
function MemberCard({ member, index }) {
  const [expanded, setExpanded] = useState(false);
  const bmiCat = getBMICategory(member.bmi);

  return (
    <motion.div
      key={member._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="card p-5 transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-400 flex items-center justify-center font-bold">
            {member.name?.[0]}
          </div>
          <div>
            <h3 className="font-medium text-white">{member.name}</h3>
            <p className={`text-xs ${member.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
              {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
            </p>
          </div>
        </div>
        {member.membershipPlan?.name && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
            {member.membershipPlan.name}
          </span>
        )}
      </div>

      {/* Contact */}
      <div className="space-y-1.5 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Mail className="w-3.5 h-3.5 text-white/30" /> {member.email}
        </div>
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Phone className="w-3.5 h-3.5 text-white/30" /> {member.phone}
          </div>
        )}
        {member.expiryDate && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            Expires: {new Date(member.expiryDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Fitness Summary Row */}
      {(member.weight || member.height || member.bmi || member.fitnessGoal) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {member.weight && (
            <span className="flex items-center gap-1 text-xs bg-white/5 rounded-lg px-2 py-1 text-white/50 border border-white/5">
              <Scale className="w-3 h-3" /> {member.weight} kg
            </span>
          )}
          {member.height && (
            <span className="flex items-center gap-1 text-xs bg-white/5 rounded-lg px-2 py-1 text-white/50 border border-white/5">
              <Ruler className="w-3 h-3" /> {member.height} cm
            </span>
          )}
          {member.bmi && bmiCat && (
            <span className={`flex items-center gap-1 text-xs rounded-lg px-2 py-1 border ${bmiCat.bg} ${bmiCat.color}`}>
              <Activity className="w-3 h-3" /> BMI {member.bmi} · {bmiCat.label}
            </span>
          )}
          {member.fitnessGoal && (
            <span className="flex items-center gap-1 text-xs bg-violet-500/10 rounded-lg px-2 py-1 text-violet-400 border border-violet-500/20 capitalize">
              <Target className="w-3 h-3" /> {member.fitnessGoal}
            </span>
          )}
        </div>
      )}

      {/* Expand / Collapse Progress */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 py-1 transition-colors"
      >
        <TrendingUp className="w-3.5 h-3.5" />
        {expanded ? 'Hide progress' : 'Show progress chart'}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <MiniProgressChart memberId={member._id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TrainerDashboard() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedMembers = async () => {
      try {
        const res = await memberService.getAll({ trainerAssigned: user._id, limit: 100 });
        setMembers(res.data.members || []);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedMembers();
  }, [user._id]);

  const activeCount = members.filter(m => m.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="page-header mb-8">
        <h1 className="page-title">Trainer Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! Here are your assigned members.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-white/60 font-medium">Assigned Members</p>
          </div>
          <p className="text-3xl font-display font-bold text-white mt-1">{members.length}</p>
        </div>

        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-white/60 font-medium">Active Clients</p>
          </div>
          <p className="text-3xl font-display font-bold text-white mt-1">{activeCount}</p>
        </div>

        <div className="card p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-white/60 font-medium">Tracking Progress</p>
          </div>
          <p className="text-3xl font-display font-bold text-white mt-1">
            {members.filter(m => m.weight).length}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-primary-400" /> My Clients
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-2 card flex flex-col items-center justify-center h-48 text-white/30">
            <UserCheck className="w-14 h-14 mb-3 opacity-30" />
            <p className="font-medium">No members assigned yet</p>
            <p className="text-sm mt-1">Ask your admin to assign members to you</p>
          </div>
        ) : (
          members.map((member, i) => (
            <MemberCard key={member._id} member={member} index={i} />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
