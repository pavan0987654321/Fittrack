import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Zap, Users, CreditCard, Dumbbell, BarChart3, ClipboardList,
  ArrowRight, TrendingUp, Shield, CheckCircle2, Star,
  Activity, Calendar, Bell, ChevronRight, Menu, X,
  IndianRupee, Award, Clock, Target
} from 'lucide-react';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Preview', href: '#preview' },
  { label: 'Stats', href: '#stats' },
  { label: 'Contact', href: '#footer' },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Member Management',
    desc: 'Onboard, track, and manage all gym members with detailed profiles, plan history, and attendance logs.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.35)',
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    desc: 'Collect dues, process payments, send reminders, and generate revenue reports automatically.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    icon: Dumbbell,
    title: 'Trainer Management',
    desc: 'Assign certified trainers, manage schedules, and monitor trainer–member performance metrics.',
    color: 'from-violet-500 to-purple-700',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    icon: ClipboardList,
    title: 'Membership Plans',
    desc: 'Create flexible monthly, quarterly, or annual plans with custom pricing and feature sets.',
    color: 'from-orange-500 to-rose-600',
    glow: 'rgba(249,115,22,0.35)',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Visualise growth trends, revenue charts, member retention, and trainer performance in one view.',
    color: 'from-pink-500 to-fuchsia-600',
    glow: 'rgba(236,72,153,0.35)',
  },
];

const STATS = [
  { end: 1000, suffix: '+', label: 'Members Managed', icon: Users, color: 'text-blue-400' },
  { end: 5, suffix: 'L+', prefix: '₹', label: 'Revenue Tracked', icon: IndianRupee, color: 'text-emerald-400' },
  { end: 50, suffix: '+', label: 'Trainers Supported', icon: Award, color: 'text-violet-400' },
];

const FOOTER_LINKS = [
  { label: 'Login', to: '/login' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#footer' },
];

// ─────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

const stagger = (delayChildren = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delayChildren } },
});

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

// ─────────────────────────────────────────────
// FLOATING PARTICLES
// ─────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 8 + 6,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Extra glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-accent-500/8 rounded-full blur-3xl" />
    </div>
  );
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────
function CountUp({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 18);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

// ─────────────────────────────────────────────
// MOCK DASHBOARD PREVIEW
// ─────────────────────────────────────────────
function DashboardPreview() {
  const miniStats = [
    { label: 'Total Members', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Revenue', value: '₹4.8L', change: '+8%', icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Trainers', value: '47', change: '+3', icon: Award, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Renewals Due', value: '23', change: 'this week', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const recentMembers = [
    { name: 'Arjun Sharma', plan: 'Pro · 3 months', status: 'Active', avatar: 'AS' },
    { name: 'Priya Nair', plan: 'Basic · 1 month', status: 'Active', avatar: 'PN' },
    { name: 'Rohit Verma', plan: 'Elite · 6 months', status: 'Due', avatar: 'RV' },
    { name: 'Sneha Patel', plan: 'Pro · 3 months', status: 'Active', avatar: 'SP' },
  ];

  const barHeights = [55, 72, 45, 88, 65, 78, 60, 95, 70, 82, 55, 90];

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-dark-900/90 backdrop-blur-sm shadow-2xl shadow-black/60 text-xs select-none">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-dark-850/80 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 text-center text-white/30 text-[11px]">FitTrack Admin Panel</div>
        <div className="flex items-center gap-1 text-white/30">
          <Bell className="w-3 h-3" />
          <div className="w-5 h-5 rounded-full bg-primary-500/30 flex items-center justify-center text-[9px] text-primary-300">A</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col gap-1 w-36 px-2 py-3 bg-dark-900/50 border-r border-white/5">
          {[
            { icon: Activity, label: 'Dashboard', active: true },
            { icon: Users, label: 'Members' },
            { icon: Award, label: 'Trainers' },
            { icon: CreditCard, label: 'Payments' },
            { icon: ClipboardList, label: 'Plans' },
            { icon: BarChart3, label: 'Analytics' },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                active ? 'bg-primary-500/20 text-primary-300' : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-3 space-y-3 overflow-hidden">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/40 text-[9px]">{s.label}</span>
                  <div className={`w-5 h-5 rounded-md ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-2.5 h-2.5 ${s.color}`} />
                  </div>
                </div>
                <p className="text-white font-bold text-sm leading-none">{s.value}</p>
                <p className="text-emerald-400 text-[9px] mt-1">{s.change}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {/* Bar Chart */}
            <div className="sm:col-span-3 bg-white/4 border border-white/8 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-[10px] font-medium">Revenue Overview</span>
                <span className="text-white/30 text-[9px]">Last 12 months</span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 8
                        ? 'linear-gradient(to top, #6574f3, #a78bfa)'
                        : 'rgba(101,116,243,0.25)',
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-white/20 text-[8px]">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                  <span key={m}>{m[0]}</span>
                ))}
              </div>
            </div>

            {/* Members mini list */}
            <div className="sm:col-span-2 bg-white/4 border border-white/8 rounded-xl p-3">
              <p className="text-white/60 text-[10px] font-medium mb-2">Recent Members</p>
              <div className="space-y-2">
                {recentMembers.map((m) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-500/30 flex items-center justify-center text-primary-300 text-[8px] font-bold flex-shrink-0">
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-[9px] font-medium truncate">{m.name}</p>
                      <p className="text-white/30 text-[8px] truncate">{m.plan}</p>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                      m.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">FitTrack</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-white/50 hover:text-white transition-colors duration-200 font-medium">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-5">Login</Link>
          <Link to="/login" className="btn-primary text-sm py-2 px-5 flex items-center gap-1.5">
            Request Demo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="block text-sm text-white/60 hover:text-white py-1" onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">Login</Link>
                <Link to="/login" className="btn-primary text-sm py-2 px-4 flex-1 text-center">Demo</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const previewRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: previewRef, offset: ['start end', 'end start'] });
  const previewScale = useTransform(scrollYProgress, [0, 0.5], [0.93, 1]);
  const previewY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════
          1. HERO
         ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 pt-16">
        <Particles />

        {/* Animated mesh grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(101,116,243,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(101,116,243,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-5xl mx-auto z-10">
          {/* Badge */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-300 text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Now live — All-in-one Gym Management
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight mb-6"
          >
            FitTrack –{' '}
            <span className="relative">
              <span className="text-gradient">Gym Management</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-primary-500/0 via-primary-500/60 to-primary-500/0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />
            </span>
            <br />System
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.45 }}
            className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage members, trainers, memberships, and payments in one powerful dashboard. Built for modern gym owners.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div variants={fadeUp}>
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-0.5 text-base"
              >
                Login to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 text-base"
              >
                Request Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/30 text-sm"
          >
            {['No credit card', 'Free 14-day trial', 'Cancel anytime'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════
          2. FEATURES
         ══════════════════════════════════ */}
      <section id="features" className="py-28 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Everything you need
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Powerful Features,<br />
              <span className="text-gradient">Built for Growth</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-lg max-w-xl mx-auto">
              Five core modules designed to take the complexity out of gym administration.
            </motion.p>
          </motion.div>

          {/* 5 Feature cards — 3 on top row, 2 on bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className={`group relative bg-white/4 border border-white/8 rounded-2xl p-6 cursor-default overflow-hidden transition-colors duration-300 hover:bg-white/8 hover:border-white/15 ${
                  i === 3 ? 'sm:col-start-1 lg:col-start-auto' : ''
                }`}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${f.glow} 0%, transparent 60%)` }}
                />

                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="relative font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="relative text-white/45 text-sm leading-relaxed">{f.desc}</p>

                <div className="relative mt-5 flex items-center gap-1 text-xs font-medium text-white/30 group-hover:text-primary-400 transition-colors duration-300">
                  Learn more <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. DASHBOARD PREVIEW
         ══════════════════════════════════ */}
      <section id="preview" className="py-24 px-6 md:px-12 overflow-hidden" ref={previewRef}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Product preview
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Your Command Center
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-lg max-w-xl mx-auto">
              A sleek, intuitive dashboard that gives you full control at a glance.
            </motion.p>
          </motion.div>

          {/* Preview wrapper with parallax */}
          <motion.div
            style={{ scale: previewScale, y: previewY }}
            className="relative"
          >
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/20 via-violet-600/20 to-accent-500/10 rounded-3xl blur-2xl" />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <DashboardPreview />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. STATS / COUNT-UP
         ══════════════════════════════════ */}
      <section id="stats" className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3">By the numbers</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
              Trusted by <span className="text-gradient">Gyms Nationwide</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger(0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative group bg-white/4 border border-white/8 rounded-2xl p-8 text-center overflow-hidden hover:bg-white/8 hover:border-white/15 transition-colors duration-300"
              >
                {/* BG glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-radial from-primary-500/10 to-transparent rounded-2xl" />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5`}>
                    <s.icon className={`w-7 h-7 ${s.color}`} />
                  </div>

                  <p className={`font-display font-bold text-5xl md:text-6xl mb-2 ${s.color}`}>
                    <CountUp end={s.end} suffix={s.suffix} prefix={s.prefix || ''} />
                  </p>
                  <p className="text-white/50 text-base font-medium">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER
         ══════════════════════════════════ */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-violet-700 to-accent-600 opacity-90" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative px-10 py-16 text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white/80 text-sm font-medium mb-6">
              <Target className="w-3.5 h-3.5" /> Start your free trial today
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
              Ready to Supercharge <br />Your Gym?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
              Join hundreds of gym owners who simplified their operations with FitTrack.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 hover:bg-white/90 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 text-base"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
              >
                Request Demo
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          5. FOOTER
         ══════════════════════════════════ */}
      <footer id="footer" className="border-t border-white/5 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md shadow-primary-500/20">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white text-lg">FitTrack</span>
              </div>
              <p className="text-white/30 text-sm max-w-xs text-center md:text-left">
                The modern gym management platform built for ambitious fitness businesses.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              {FOOTER_LINKS.map((l) =>
                l.to ? (
                  <Link key={l.label} to={l.to} className="hover:text-white transition-colors duration-200">
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.label} href={l.href} className="hover:text-white transition-colors duration-200">
                    {l.label}
                  </a>
                )
              )}
              <span className="text-white/20">·</span>
              <span className="text-white/25">Privacy</span>
              <span className="text-white/25">Terms</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-white/20 text-xs">
            © {new Date().getFullYear()} FitTrack — Built with ❤️ for modern gym owners
          </div>
        </div>
      </footer>
    </div>
  );
}
