import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Dumbbell, Calendar, CreditCard, CheckCircle2, AlertCircle,
  TrendingUp, Scale, Ruler, Target, Edit3, X, Save, Activity,
  ChevronUp, ChevronDown, Bell, Clock, Zap, CheckSquare,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../context/useAuthStore';
import { authService, paymentService, progressService, subscriptionService, attendanceService } from '../services/api';
import SubscribeModal from '../components/SubscribeModal';
import toast from 'react-hot-toast';

// ── BMI Helper ────────────────────────────────────────────────────────────────
function getBMICategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  return                 { label: 'Obese',        color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

const FITNESS_GOALS = ['weight loss', 'muscle gain', 'endurance', 'flexibility', 'general fitness'];
const GENDERS       = ['male', 'female', 'other'];

// ── Custom Tooltip for Recharts ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-sm font-bold text-primary-400">{payload[0].value} kg</p>
    </div>
  );
}

// ── Stat Mini Card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'primary', sub }) {
  const colors = {
    primary: 'bg-primary-500/10 text-primary-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet:  'bg-violet-500/10 text-violet-400',
    amber:   'bg-amber-500/10 text-amber-400',
  };
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-white/40 font-medium mb-0.5">{label}</p>
        <p className="text-lg font-bold text-white leading-tight">{value ?? '—'}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const { user, setUser } = useAuthStore();
  const [details, setDetails]           = useState(null);
  const [payments, setPayments]         = useState([]);
  const [progress, setProgress]         = useState([]);
  const [myRequests, setMyRequests]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showEdit, setShowEdit]         = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [form, setForm]                 = useState({});
  // Attendance state
  const [todayAttendance, setTodayAttendance] = useState(null); // 'present' | 'absent' | null
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStats, setAttendanceStats]     = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [meRes, progRes, reqRes, todayRes, histRes] = await Promise.all([
        authService.getMe(),
        progressService.getMyProgress(),
        subscriptionService.getMyRequests(),
        attendanceService.getToday(),
        attendanceService.getMyHistory({ limit: 60 }),
      ]);
      const meData = meRes.data;
      setDetails(meData);
      const memberId = meData.memberId || meData._id;
      const payRes = await paymentService.getAll({ memberId, limit: 50 });
      setPayments(payRes.data.payments || []);
      setProgress(progRes.data || []);
      setMyRequests(reqRes.data || []);
      setTodayAttendance(todayRes.data?.status || null);
      const hist = histRes.data || [];
      setAttendanceHistory(hist);
      // Fetch stats if we have a memberId
      if (memberId) {
        try {
          const statsRes = await attendanceService.getStats(memberId);
          setAttendanceStats(statsRes.data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load member dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Pre-fill edit form when details load
  useEffect(() => {
    if (details) {
      setForm({
        name:        details.name        || '',
        age:         details.age         || '',
        height:      details.height      || '',
        weight:      details.weight      || '',
        fitnessGoal: details.fitnessGoal || '',
        gender:      details.gender      || '',
        phone:       details.phone       || '',
        address:     details.address     || '',
      });
    }
  }, [details]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.age)    payload.age    = Number(payload.age);
      if (payload.height) payload.height = Number(payload.height);
      if (payload.weight) payload.weight = Number(payload.weight);

      const res = await authService.updateProfile(payload);
      setDetails(res.data);
      if (res.data.token) {
        useAuthStore.setState(s => ({ ...s, token: res.data.token, user: res.data }));
      }
      // Refresh progress chart
      const progRes = await progressService.getMyProgress();
      setProgress(progRes.data || []);

      toast.success('Profile updated!');
      setShowEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Format progress data for chart
  const chartData = progress.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: p.weight,
  }));

  // Weight trend
  const weightTrend = progress.length >= 2
    ? progress[progress.length - 1].weight - progress[0].weight
    : null;

  const bmiCat = getBMICategory(details?.bmi);

  // ── Mark Attendance Handler ────────────────────────────────────────────────
  const handleMarkAttendance = async () => {
    setMarkingAttendance(true);
    try {
      await attendanceService.mark({ status: 'present' });
      setTodayAttendance('present');
      toast.success('Attendance marked! Great job showing up 💪');
      // Refresh history & stats
      const [histRes] = await Promise.all([attendanceService.getMyHistory({ limit: 60 })]);
      setAttendanceHistory(histRes.data || []);
      const memberId = details?.memberId || details?._id;
      if (memberId) {
        const statsRes = await attendanceService.getStats(memberId);
        setAttendanceStats(statsRes.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  // Build last-30-days calendar dots
  const buildCalendarDays = () => {
    const days = [];
    const today = new Date();
    const histMap = {};
    attendanceHistory.forEach(r => { histMap[r.date] = r.status; });
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA');
      days.push({
        key,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dayLabel: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        status: histMap[key] || null,
        isToday: i === 0,
      });
    }
    return days;
  };
  const calendarDays = buildCalendarDays();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate Expiry Warning
  let daysToExpiry = null;
  if (details?.expiryDate) {
    const diffTime = new Date(details.expiryDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 5) {
      daysToExpiry = diffDays;
    }
  }

  return (
    <DashboardLayout>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header mb-8 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here's your fitness overview.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowSubscribe(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-300 border border-primary-500/30 hover:from-primary-500/30 hover:to-accent-500/30 transition-all text-sm font-medium"
          >
            <Bell className="w-4 h-4" /> Subscribe to Plan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </motion.button>
        </div>
      </div>

      {daysToExpiry !== null && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-400">Membership Expiring Soon</h3>
            <p className="text-sm text-amber-400/80 mt-0.5">Your membership will expire in <b>{daysToExpiry} days</b>. Please renew your plan to continue accessing the gym smoothly.</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSubscribe(true)} className="px-4 py-2 bg-amber-500 text-dark-900 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 whitespace-nowrap">
            Renew Now
          </motion.button>
        </motion.div>
      )}

      {/* ── Top Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="card p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <User className="w-24 h-24" />
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-primary-500/20">
            {user?.name?.[0]}
          </div>
          <h2 className="text-xl font-display font-semibold text-white">{user?.name}</h2>
          <p className="text-sm text-white/50 mb-1">{user?.email}</p>
          {details?.phone && <p className="text-sm text-white/40 mb-4">{details.phone}</p>}

          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Membership</span>
              {details?.status === 'active' ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5" /> {details?.status || 'Inactive'}
                </span>
              )}
            </div>
            {details?.trainerAssigned?.name && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">Trainer</span>
                <span className="text-sm font-medium text-white">{details.trainerAssigned.name}</span>
              </div>
            )}
            {details?.fitnessGoal && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">Goal</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 capitalize">
                  {details.fitnessGoal}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Plan + Fitness Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-6 lg:col-span-2 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Plan row */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/40 font-medium mb-1 uppercase tracking-wider">Current Plan</p>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                {details?.membershipPlan?.name || 'No Plan Selected'}
              </h2>
              <div className="flex flex-col gap-1 mt-2">
                {details?.membershipPlan?.price && (
                  <p className="text-sm text-white/50">
                    ₹{details.membershipPlan.price.toLocaleString()} / {details.membershipPlan.duration} months
                  </p>
                )}
                {details?.expiryDate && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-primary-500/10 text-primary-400 border border-primary-500/20 w-max">
                    <Calendar className="w-3.5 h-3.5" /> Valid until {new Date(details.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Clock} label="Last Updated" color="primary"
              value={details?.updatedAt
                ? new Date(details.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Today'}
            />
            <StatCard icon={User} label="Age" color="violet"
              value={details?.age ? `${details.age} yrs` : '—'}
              sub={details?.gender ? details.gender.charAt(0).toUpperCase() + details.gender.slice(1) : ''}
            />
            <StatCard icon={Ruler} label="Height" color="emerald"
              value={details?.height ? `${details.height} cm` : '—'}
            />
            <StatCard icon={Scale} label="Weight" color="amber"
              value={details?.weight ? `${details.weight} kg` : '—'}
            />
          </div>
        </motion.div>
      </div>

      {/* ── BMI + Progress ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* BMI Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-6 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-400" />
            <h3 className="font-display font-semibold text-white">Body Mass Index</h3>
          </div>

          {details?.bmi ? (
            <>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-display font-bold text-white">{details.bmi}</span>
                <span className="text-white/40 text-sm mb-2">kg/m²</span>
              </div>
              {bmiCat && (
                <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full border ${bmiCat.bg} ${bmiCat.color} mb-4`}>
                  {bmiCat.label}
                </span>
              )}
              {/* BMI visual bar */}
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-white/30 mb-1">
                  <span>Underweight</span><span>Obese</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500"
                    style={{ width: `${Math.min(((details.bmi - 15) / 25) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/20 mt-1">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 py-6">
              <Scale className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Set height & weight to calculate BMI</p>
            </div>
          )}
        </motion.div>

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <h3 className="font-display font-semibold text-white">Weight Progress</h3>
            </div>
            {weightTrend !== null && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border
                ${weightTrend < 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : weightTrend > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-white/5 text-white/40 border-white/10'}`}>
                {weightTrend < 0
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : weightTrend > 0
                    ? <ChevronUp className="w-3.5 h-3.5" />
                    : null}
                {Math.abs(weightTrend).toFixed(1)} kg
              </div>
            )}
          </div>

          {chartData.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30">
              <TrendingUp className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Update your weight to track progress</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Attendance Tracking ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="card overflow-hidden mb-6"
      >
        {/* Header + Mark button */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-white">Attendance</h2>
              <p className="text-xs text-white/40 mt-0.5">Last 30 days · Today is {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>

          {/* Today status + Mark button */}
          {todayAttendance === 'present' ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" /> Present Today ✓
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleMarkAttendance}
              disabled={markingAttendance}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-60 self-start sm:self-auto"
            >
              {markingAttendance
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Zap className="w-4 h-4" />}
              Mark Attendance
            </motion.button>
          )}
        </div>

        {/* Stats row */}
        {attendanceStats && (
          <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
            {[
              { label: 'Days Present', value: attendanceStats.present, color: 'text-emerald-400' },
              { label: 'Days Absent',  value: attendanceStats.absent,  color: 'text-red-400' },
              { label: 'Current Streak', value: `${attendanceStats.streak} 🔥`, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="p-4 text-center">
                <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* 30-day calendar grid */}
        <div className="p-5">
          <div className="grid grid-cols-10 gap-1.5">
            {calendarDays.map(day => (
              <div key={day.key} className="flex flex-col items-center gap-1" title={`${day.label} — ${day.status || 'no record'}`}>
                <span className="text-[9px] text-white/25 leading-none">{day.dayLabel.slice(0, 1)}</span>
                <div className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all
                  ${day.status === 'present'
                    ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-400'
                    : day.status === 'absent'
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                      : day.isToday
                        ? 'bg-white/10 border border-white/20 text-white/60 ring-2 ring-primary-500/50'
                        : 'bg-white/5 border border-white/5 text-white/20'}`}>
                  {new Date(day.key).getDate()}
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 justify-end">
            {[
              { color: 'bg-emerald-500/25 border-emerald-500/40', label: 'Present' },
              { color: 'bg-red-500/20 border-red-500/30', label: 'Absent' },
              { color: 'bg-white/5 border-white/5', label: 'No record' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm border ${l.color}`} />
                <span className="text-xs text-white/30">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── My Subscription Requests ─────────────────────────────────── */}
      {myRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="card overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary-400" />
            <h2 className="font-display font-semibold text-lg text-white">Subscription Requests</h2>
          </div>
          <div className="divide-y divide-white/5">
            {myRequests.map(req => (
              <div key={req._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{req.planId?.name || '—'}</p>
                    <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                      {req.preferredTime ? ` · ${req.preferredTime}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-12 sm:ml-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                    ${ req.status === 'pending'  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                     : req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                     : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  {req.status === 'pending' && (
                    <span className="text-xs text-white/30">Awaiting admin review</span>
                  )}
                  {req.status === 'approved' && (
                    <span className="text-xs text-emerald-400/70">Plan activated ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Payment History ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary-400" />
          <h2 className="font-display font-semibold text-lg text-white">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 text-white/30">
            <CreditCard className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No payment history yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  {['Date', 'Amount', 'Method', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                    <td className="px-6 py-4 text-sm text-white/80">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">₹{payment.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-white/50 capitalize">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${payment.status === 'paid'    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : payment.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Subscribe Modal ───────────────────────────────────────────────── */}
      <SubscribeModal
        isOpen={showSubscribe}
        onClose={() => setShowSubscribe(false)}
        defaultPlanId={details?.membershipPlan?._id || ''}
        onSuccess={() => fetchAll()}
      />
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-semibold text-lg text-white">Update Profile</h2>
                </div>
                <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Basic */}
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Basic Info</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', full: true },
                    { key: 'phone', label: 'Phone', type: 'text' },
                    { key: 'age',  label: 'Age (years)', type: 'number' },
                    { key: 'gender', label: 'Gender', type: 'select', options: GENDERS },
                  ].map(field => (
                    <div key={field.key} className={field.full ? 'col-span-2' : ''}>
                      <label className="text-xs text-white/50 font-medium mb-1.5 block capitalize">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={form[field.key] || ''}
                          onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                        >
                          <option value="">Select…</option>
                          {field.options.map(o => (
                            <option key={o} value={o} className="bg-dark-800 capitalize">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={form[field.key] || ''}
                          onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Fitness */}
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest pt-2">Fitness Data</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'height', label: 'Height (cm)', type: 'number' },
                    { key: 'weight', label: 'Weight (kg)', type: 'number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-white/50 font-medium mb-1.5 block">{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.key] || ''}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary-500/50 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs text-white/50 font-medium mb-1.5 block">Fitness Goal</label>
                    <select
                      value={form.fitnessGoal || ''}
                      onChange={e => setForm(f => ({ ...f, fitnessGoal: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                    >
                      <option value="">Select goal…</option>
                      {FITNESS_GOALS.map(g => (
                        <option key={g} value={g} className="bg-dark-800 capitalize">{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BMI preview */}
                {form.height && form.weight && (() => {
                  const hm = Number(form.height) / 100;
                  const bmi = Math.round((Number(form.weight) / (hm * hm)) * 10) / 10;
                  const cat = getBMICategory(bmi);
                  return (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <Activity className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-white/60">Calculated BMI:</span>
                      <span className="font-bold text-white">{bmi}</span>
                      {cat && <span className={`text-xs font-semibold ${cat.color}`}>({cat.label})</span>}
                    </div>
                  );
                })()}
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-all disabled:opacity-60"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
