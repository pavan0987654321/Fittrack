import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { notificationService } from '../services/api';
import useAuthStore from '../context/useAuthStore';

export default function NotificationDropdown() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getMyNotifications();
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeBg = (type, isRead) => {
    if (isRead) return 'bg-white/5 border border-white/5 opacity-70';
    switch (type) {
      case 'success': return 'bg-emerald-500/10 border border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 border border-amber-500/20';
      default:        return 'bg-blue-500/10 border border-blue-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-dark-900 border-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-dark-850 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1.5 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-white/30 text-sm">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n._id}
                    className={`relative flex items-start gap-3 p-3 rounded-xl transition-all ${getTypeBg(n.type, n.isRead)} hover:bg-white/10`}
                  >
                    <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                    <div className="flex-1 pr-6">
                      <p className={`text-sm ${n.isRead ? 'text-white/60' : 'text-white font-medium'} leading-snug`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(n._id, e)}
                        className="absolute right-3 top-3 p-1 rounded-full text-white/20 hover:text-white/60 hover:bg-white/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
