import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Phone, Mail, Calendar, UserCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import useAuthStore from '../context/useAuthStore';
import { memberService } from '../services/api';

const MOCK_ASSIGNED_MEMBERS = [
  { _id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', status: 'active', goal: 'Weight Loss' },
  { _id: '2', name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543211', status: 'active', goal: 'Muscle Gain' },
  { _id: '3', name: 'Arjun Kumar', email: 'arjun@example.com', phone: '+91 9876543212', status: 'inactive', goal: 'Endurance' },
];

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
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedMembers();
  }, [user._id]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Trainer Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! Here are your assigned members.</p>
      </div>

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
          <p className="text-3xl font-display font-bold text-white mt-1">
            {members.filter(m => m.status === 'active').length}
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
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 hover:bg-white/5 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
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

              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Mail className="w-4 h-4 text-white/30" /> {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Phone className="w-4 h-4 text-white/30" /> {member.phone}
                </div>
                {member.expiryDate && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Calendar className="w-4 h-4 text-white/30" />
                    Expires: {new Date(member.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
