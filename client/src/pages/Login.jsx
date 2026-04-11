import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';
import useAuthStore from '../context/useAuthStore';

/* ─────────────────────────────────────────
   Shared input style — solid dark bg so
   browsers can NEVER make text invisible
───────────────────────────────────────── */
const inputStyle = {
  width: '100%',
  backgroundColor: '#0f172a',
  color: '#ffffff',
  WebkitTextFillColor: '#ffffff',
  caretColor: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '12px 16px 12px 42px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputFocus = {
  borderColor: 'rgba(101,116,243,0.7)',
  boxShadow: '0 0 0 3px rgba(101,116,243,0.15)',
};

const inputBlur = {
  borderColor: 'rgba(255,255,255,0.12)',
  boxShadow: 'none',
};

export default function Login() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  const [tab,          setTab]          = useState('login');   // 'login' | 'register'
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [demoLoading,  setDemoLoading]  = useState(false);
  const [error,        setError]        = useState('');
  const [form,         setForm]         = useState({ name: '', email: '', password: '', role: 'member' });

  const isLogin = tab === 'login';

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = isLogin
        ? await authService.login({ email: form.email, password: form.password })
        : await authService.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      const { token, ...user } = res.data;
      setAuth(user, token);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'trainer') navigate('/trainer-dashboard');
      else navigate('/member-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      try {
        await authService.register({ name: 'Admin User', email: 'admin@fittrack.com', password: 'admin123', role: 'admin' });
      } catch { /* already exists */ }
      const res = await authService.login({ email: 'admin@fittrack.com', password: 'admin123' });
      const { token, ...user } = res.data;
      setAuth(user, token);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'trainer') navigate('/trainer-dashboard');
      else navigate('/member-dashboard');
    } catch {
      setError('Demo login failed. Is the backend server running on port 5000?');
    } finally {
      setDemoLoading(false);
    }
  };

  const busy = loading || demoLoading;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden', backgroundColor: '#080e1a' }}>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(101,116,243,0.12) 0%, transparent 65%)', animation: 'pulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)', animation: 'pulse 10s ease-in-out infinite reverse' }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '1.25rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6574f3, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(101,116,243,0.35)' }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#fff', letterSpacing: '-0.5px' }}>FitTrack</span>
          </Link>
          <h1 style={{ fontWeight: 700, fontSize: '24px', color: '#fff', margin: 0 }}>
            {isLogin ? 'Welcome back 👋' : 'Create account'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '6px' }}>
            {isLogin ? 'Sign in to manage your gym dashboard' : 'Set up your FitTrack workspace now'}
          </p>
        </div>

        {/* Glass card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '24px', gap: '4px' }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(''); setForm({ name: '', email: '', password: '', role: 'admin' }); }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: tab === t ? 'linear-gradient(135deg, #5145cd, #7c3aed)' : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: tab === t ? '0 4px 12px rgba(101,116,243,0.25)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Error box */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 14px', color: '#f87171', fontSize: '14px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Name — register only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="relative mb-2">
                    <User size={16} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
                    <input
                      name="name"
                      id="name"
                      type="text"
                      placeholder=" "
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="floating-input peer pl-12"
                    />
                    <label htmlFor="name" className="floating-label">Full Name</label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative mb-2">
              <Mail size={16} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
              <input
                name="email"
                id="email"
                type="email"
                placeholder=" "
                value={form.email}
                onChange={handleChange}
                required
                className="floating-input peer pl-12"
              />
              <label htmlFor="email" className="floating-label">Email Address</label>
            </div>

            {/* Password */}
            <div className="relative mb-2">
              <Lock size={16} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
              <input
                name="password"
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder=" "
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="floating-input peer pl-12 pr-12"
              />
              <label htmlFor="password" className="floating-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', zIndex: 10 }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Role — register only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={{ ...inputStyle, padding: '12px 16px 12px 16px', appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e  => Object.assign(e.target.style, inputBlur)}
                  >
                    <option value="admin"   style={{ backgroundColor: '#0f172a' }}>Admin</option>
                    <option value="trainer" style={{ backgroundColor: '#0f172a' }}>Trainer</option>
                    <option value="member"  style={{ backgroundColor: '#0f172a' }}>Member</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={busy}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                cursor: busy ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #5145cd, #7c3aed)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: busy ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(101,116,243,0.3)',
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {isLogin ? 'Signing in…' : 'Creating account…'}</>
                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Demo login */}
          <button
            type="button"
            onClick={handleDemo}
            disabled={busy}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: busy ? 'not-allowed' : 'pointer',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: busy ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {demoLoading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Loading demo…</>
              : <><Zap size={15} color="#818cf8" /> Quick Demo Login</>
            }
          </button>
        </div>

        {/* Demo hint */}
        <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Demo: admin@fittrack.com / admin123</span>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
          transition: background-color 9999s ease-in-out 0s;
          caret-color: #ffffff;
        }
      `}</style>
    </div>
  );
}
