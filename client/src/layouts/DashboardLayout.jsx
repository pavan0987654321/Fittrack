import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard, UserCheck,
  LogOut, Menu, X, ChevronRight, Bell, Search,
  Zap, CheckSquare, FlaskConical, UserCircle, ArrowRight,
  Save, Loader2, CheckCircle, AlertCircle, Lock, Mail, User,
} from 'lucide-react';
import useAuthStore from '../context/useAuthStore';
import NotificationDropdown from '../components/NotificationDropdown';
import { memberService, trainerService, planService, paymentService, authService } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Nav configs
───────────────────────────────────────────────────────────── */
const adminNav = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/members',         label: 'Members',   icon: Users },
  { path: '/trainers',        label: 'Trainers',  icon: UserCheck },
  { path: '/plans',           label: 'Plans',     icon: Dumbbell },
  { path: '/payments',        label: 'Payments',  icon: CreditCard },
  { path: '/attendance',      label: 'Attendance', icon: CheckSquare },
];
const trainerNav = [
  { path: '/trainer-dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/members',           label: 'My Members', icon: Users },
  { path: '/attendance',        label: 'Attendance', icon: CheckSquare },
];
const memberNav = [
  { path: '/member-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/plans', label: 'Buy Plan', icon: Dumbbell },
];

/* ─────────────────────────────────────────────────────────────
   Global Search Component
───────────────────────────────────────────────────────────── */
function GlobalSearch({ userRole }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState(0);
  const searchRef               = useRef(null);
  const inputRef                = useRef(null);
  const navigate                = useNavigate();
  const debounceRef             = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Keyboard: /, Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const runSearch = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const promises = [];

      // Members (all roles)
      promises.push(
        memberService.getAll({ search: q, limit: 5 }).then(r =>
          (r.data.members || []).map(m => ({
            id: m._id,
            type: 'Member',
            icon: '👤',
            title: m.name,
            subtitle: `${m.email} · ${m.status} · ${m.membershipPlan?.name || 'No Plan'}`,
            badge: m.status,
            badgeColor: m.status === 'active' ? '#34d399' : m.status === 'expired' ? '#f87171' : '#94a3b8',
            action: () => navigate('/members'),
          }))
        ).catch(() => [])
      );

      // Trainers (admin only)
      if (userRole === 'admin') {
        promises.push(
          trainerService.getAll().then(r =>
            (r.data || [])
              .filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || t.specialty?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 3)
              .map(t => ({
                id: t._id,
                type: 'Trainer',
                icon: '🏋️',
                title: t.name,
                subtitle: `${t.specialty} · ${t.experience} yrs exp`,
                badge: t.status,
                badgeColor: t.status === 'active' ? '#34d399' : '#94a3b8',
                action: () => navigate('/trainers'),
              }))
          ).catch(() => [])
        );

        // Plans
        promises.push(
          planService.getAll().then(r =>
            (r.data || [])
              .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 3)
              .map(p => ({
                id: p._id,
                type: 'Plan',
                icon: '💳',
                title: p.name,
                subtitle: `₹${p.price?.toLocaleString('en-IN')} · ${p.duration} months`,
                badge: `₹${p.price?.toLocaleString('en-IN')}`,
                badgeColor: '#818cf8',
                action: () => navigate('/plans'),
              }))
          ).catch(() => [])
        );

        // Payments — search by member name
        promises.push(
          paymentService.getAll({ limit: 50 }).then(r =>
            (r.data.payments || [])
              .filter(p => p.memberId?.name?.toLowerCase().includes(q.toLowerCase()))
              .slice(0, 3)
              .map(p => ({
                id: p._id,
                type: 'Payment',
                icon: '💰',
                title: `₹${p.amount?.toLocaleString('en-IN')} — ${p.memberId?.name}`,
                subtitle: `${p.status} · ${p.method || p.paymentMethod || 'N/A'} · ${new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                badge: p.status,
                badgeColor: p.status === 'paid' ? '#34d399' : p.status === 'pending' ? '#fbbf24' : '#f87171',
                action: () => navigate('/payments'),
              }))
          ).catch(() => [])
        );
      }

      const all = (await Promise.all(promises)).flat();
      setResults(all);
      setActive(0);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(val), 350);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) {
      results[active].action();
      setOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (item) => {
    item.action();
    setOpen(false);
    setQuery('');
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="relative flex-1 max-w-sm hidden sm:block" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search members, trainers, plans… (press /)"
        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-500/40 focus:bg-white/8 transition-all"
      />
      {/* Loading spinner */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-400/40 border-t-primary-400 rounded-full animate-spin" />
      )}

      {/* Slash badge when idle */}
      {!loading && !query && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono">/</kbd>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 shadow-2xl z-[200] overflow-hidden backdrop-blur-md"
            style={{ background: 'rgba(10,15,30,0.97)' }}
          >
            {results.length === 0 && !loading ? (
              <div className="px-4 py-6 text-center text-sm text-white/30">
                No results for <strong className="text-white/50">"{query}"</strong>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-white/5 text-[11px] text-white/30 font-medium tracking-wide uppercase">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {results.map((item, i) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onMouseDown={() => handleSelect(item)}
                      onMouseEnter={() => setActive(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        active === i ? 'bg-primary-500/15' : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-white/40 truncate">{item.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: item.badgeColor, background: `${item.badgeColor}22` }}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded font-medium">{item.type}</span>
                      </div>
                      {active === i && <ArrowRight className="w-3 h-3 text-white/30 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-white/20">
                  <span><kbd className="border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
                  <span><kbd className="border border-white/10 rounded px-1">↵</kbd> open</span>
                  <span><kbd className="border border-white/10 rounded px-1">Esc</kbd> close</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Profile Settings Modal
───────────────────────────────────────────────────────────── */
function ProfileModal({ open, onClose, user, setAuth }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]   = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
      setSuccess('');
      setError('');
    }
  }, [open, user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await authService.updateProfile(payload);
      const { token, ...updatedUser } = res.data;
      setAuth(updatedUser, token);
      setSuccess('Profile updated successfully!');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 12px 10px 38px',
    fontSize: '14px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, backdropFilter: 'blur(4px)' }}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: '420px',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '28px',
              zIndex: 901,
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6574f3, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCircle size={18} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Profile Settings</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Update your account details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6574f3, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', boxShadow: '0 8px 24px rgba(101,116,243,0.35)' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
                    padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
                    background: error ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.25)' : 'rgba(52,211,153,0.25)'}`,
                    color: error ? '#f87171' : '#34d399',
                  }}
                >
                  {error ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                  {error || success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Name */}
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required style={fieldStyle} />
              </div>
              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required style={fieldStyle} />
              </div>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>change password (optional)</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>
              {/* New Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input name="password" type="password" placeholder="New Password" value={form.password} onChange={handleChange} style={fieldStyle} />
              </div>
              {/* Confirm Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input name="confirmPassword" type="password" placeholder="Confirm New Password" value={form.confirmPassword} onChange={handleChange} style={fieldStyle} />
              </div>
              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #5145cd, #7c3aed)',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '4px', boxShadow: '0 4px 16px rgba(101,116,243,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {saving
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : <><Save size={15} /> Save Changes</>
                }
              </button>
            </form>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Layout
───────────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }) {
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, setAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'trainer' ? trainerNav : memberNav;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dark-900">

      {/* ── Demo Mode Banner ── */}
      {user?.isDemo && (
        <div
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold"
          style={{
            background: 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(251,191,36,0.10) 50%, rgba(245,158,11,0.15) 100%)',
            borderBottom: '1px solid rgba(251,191,36,0.2)',
            color: '#fbbf24',
          }}
        >
          <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            🔒 <strong>Demo Mode</strong> — All data is fictional. No real customer information is shown. Session expires in 2 hours.
          </span>
        </div>
      )}

      {/* ── Main row: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 260 : isMobile ? 0 : 72,
            x: isMobile && !sidebarOpen ? -260 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`absolute md:relative flex flex-col bg-dark-850 border-r border-white/5 z-40 h-full flex-shrink-0 ${isMobile && !sidebarOpen ? 'pointer-events-none' : ''}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 glow-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="font-display font-bold text-lg text-white whitespace-nowrap"
                >
                  FitTrack
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive ? 'bg-primary-500/15 text-primary-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl bg-primary-500/10 border border-primary-500/20"
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm font-medium relative z-10 whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && sidebarOpen && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary-400 relative z-10" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-white/5 p-3">
            <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-white/40 capitalize">{user?.role || 'admin'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={handleLogout}
                    className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Collapse button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all z-20"
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronRight className="w-3 h-3" />
            </motion.div>
          </button>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top Bar */}
          <header className="h-16 border-b border-white/5 bg-dark-900/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative z-50">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                className="md:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* ── Real Global Search ── */}
              <GlobalSearch userRole={user?.role} />
            </div>

            <div className="flex items-center gap-4 relative">
              <NotificationDropdown />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-sm font-bold text-white hover:shadow-lg hover:shadow-primary-500/20 active:scale-95 transition-all"
                >
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-dark-850 border border-white/10 rounded-2xl shadow-2xl py-2 z-[200] backdrop-blur-md"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-white/40 truncate mt-0.5">{user?.email || 'admin@fittrack.com'}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => { setDropdownOpen(false); setProfileOpen(true); }}
                          className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                        >
                          <UserCircle className="w-4 h-4" /> Profile Settings
                        </button>
                      </div>
                      <div className="border-t border-white/5 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </main>

        </div>{/* end main content */}
      </div>{/* end flex row */}

      {/* Profile Modal */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        setAuth={setAuth}
      />
    </div>
  );
}
