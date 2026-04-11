import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard, UserCheck,
  LogOut, Menu, X, ChevronRight, Bell, Search,
  Zap,
} from 'lucide-react';
import useAuthStore from '../context/useAuthStore';

const adminNav = [
  { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/trainers', label: 'Trainers', icon: UserCheck },
  { path: '/plans', label: 'Plans', icon: Dumbbell },
  { path: '/payments', label: 'Payments', icon: CreditCard },
];

const trainerNav = [
  { path: '/trainer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'My Members', icon: Users },
];

const memberNav = [
  { path: '/member-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/plans', label: 'Buy Plan', icon: Dumbbell },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex flex-col bg-dark-850 border-r border-white/5 z-10 flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 glow-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display font-bold text-lg text-white whitespace-nowrap"
              >
                FitTrack
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {(user?.role === 'admin' ? adminNav : user?.role === 'trainer' ? trainerNav : memberNav).map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-white/40 capitalize">{user?.role || 'admin'}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
        <header className="h-16 border-b border-white/5 bg-dark-900/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary-500/40 focus:bg-white/8 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            </button>
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
                    className="absolute right-0 mt-3 w-56 bg-dark-850 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-md"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-white/40 truncate mt-0.5">{user?.email || 'admin@fittrack.com'}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors flex justify-start items-center gap-2">
                        Profile Settings
                      </button>
                    </div>
                    <div className="border-t border-white/5 py-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex justify-start items-center gap-2">
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
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
