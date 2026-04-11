import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Dumbbell, Calendar, CreditCard, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../context/useAuthStore';
import { authService, paymentService } from '../services/api';

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [details, setDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await authService.getMe();
        setDetails(meRes.data);

        // Use memberId (Member doc ID) for payment lookup, not User._id
        const memberId = meRes.data.memberId || meRes.data._id;
        const payRes = await paymentService.getAll({ memberId, limit: 50 });
        setPayments(payRes.data.payments || []);
      } catch (err) {
        console.error('Failed to load member dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500/40 border-t-primary-400 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! Here's your membership overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Personal Overview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 lg:col-span-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <User className="w-24 h-24" />
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-primary-500/20">
            {user?.name?.[0]}
          </div>
          <h2 className="text-xl font-display font-semibold text-white">{user?.name}</h2>
          <p className="text-sm text-white/50 mb-6">{user?.email}</p>

          <div className="space-y-4 pt-4 border-t border-white/5">
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
          </div>
        </motion.div>

        {/* Plan Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 lg:col-span-2 flex flex-col justify-center bg-gradient-to-br from-dark-800 to-dark-900 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-white/40 font-medium mb-1 uppercase tracking-wider">Current Plan</p>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                {details?.membershipPlan?.name || 'No Plan Selected'}
              </h2>
              {details?.membershipPlan?.price && (
                <p className="text-sm text-white/50 mt-1">₹{details.membershipPlan.price.toLocaleString()} / {details.membershipPlan.duration} months</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-white/40" />
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Valid Until</p>
              </div>
              <p className="text-lg font-medium text-white">
                {details?.expiryDate
                  ? new Date(details.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white/40" />
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Payments</p>
              </div>
              <p className="text-lg font-medium text-emerald-400">{payments.length} total</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                  <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Date</th>
                  <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Amount</th>
                  <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Method</th>
                  <th className="text-left text-xs font-semibold text-white/40 px-6 py-4 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
    </DashboardLayout>
  );
}
