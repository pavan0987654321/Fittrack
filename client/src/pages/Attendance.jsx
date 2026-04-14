import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare, Users, Calendar, CheckCircle2, XCircle,
  Minus, Search, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { attendanceService, memberService } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString('en-CA');
}

function StatusBadge({ status }) {
  if (status === 'present')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Present
      </span>
    );
  if (status === 'absent')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle className="w-3 h-3" /> Absent
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/30 border border-white/10">
      <Minus className="w-3 h-3" /> No Record
    </span>
  );
}

export default function AttendancePage() {
  const [records, setRecords]     = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [dateFilter, setDateFilter] = useState(todayStr());
  const [memberFilter, setMemberFilter] = useState('');
  const [search, setSearch]       = useState('');
  const LIMIT = 20;

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (dateFilter)   params.date     = dateFilter;
      if (memberFilter) params.memberId = memberFilter;
      const res = await attendanceService.getAll(params);
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, dateFilter, memberFilter]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  useEffect(() => {
    memberService.getAll({ limit: 100 })
      .then(r => setMembers(r.data.members || []))
      .catch(() => {});
  }, []);

  // Filtered members for search dropdown
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / LIMIT);

  // Stats from today's date filter
  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount  = records.filter(r => r.status === 'absent').length;

  return (
    <DashboardLayout>
      <div className="page-header mb-8">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Track daily gym attendance for all members.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users,        label: 'Total Records', value: total,        color: 'bg-primary-500/15 text-primary-400' },
          { icon: CheckCircle2, label: 'Present',       value: presentCount, color: 'bg-emerald-500/15 text-emerald-400' },
          { icon: XCircle,      label: 'Absent',        value: absentCount,  color: 'bg-red-500/15 text-red-400' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/50">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60 font-medium">Filters</span>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-sm text-white focus:outline-none"
            />
          </div>

          {/* Member search */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-56">
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search member…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-white/20 focus:outline-none w-full"
              />
            </div>
            {search && filteredMembers.length > 0 && (
              <div className="absolute top-full mt-1 left-0 w-64 bg-dark-800 border border-white/10 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto">
                <button
                  onClick={() => { setMemberFilter(''); setSearch(''); setPage(1); }}
                  className="w-full px-3 py-2 text-left text-xs text-white/40 hover:bg-white/5 transition-colors"
                >
                  Clear filter (show all)
                </button>
                {filteredMembers.map(m => (
                  <button
                    key={m._id}
                    onClick={() => { setMemberFilter(m._id); setSearch(m.name); setPage(1); }}
                    className="w-full px-3 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {m.name[0]}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{m.name}</p>
                      <p className="text-xs text-white/40">{m.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset */}
          <button
            onClick={() => { setDateFilter(todayStr()); setMemberFilter(''); setSearch(''); setPage(1); }}
            className="text-xs text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
          <h2 className="font-display font-semibold text-white">
            Attendance Records
            {dateFilter && <span className="text-white/40 font-normal ml-2 text-sm">— {new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-white/25">
            <CheckSquare className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No attendance records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    {['Member', 'Email', 'Date', 'Status', 'Marked At'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-white/40 px-5 py-3.5 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <motion.tr
                      key={rec._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {rec.memberId?.name?.[0] || '?'}
                          </div>
                          <span className="text-sm font-medium text-white">{rec.memberId?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/50">{rec.memberId?.email || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-white/70 whitespace-nowrap">
                        {new Date(rec.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/40 whitespace-nowrap">
                        {rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <p className="text-xs text-white/40">Page {page} of {totalPages} · {total} records</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
