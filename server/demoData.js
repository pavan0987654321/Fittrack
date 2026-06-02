/**
 * demoData.js
 * All hardcoded fake data returned when a demo JWT is detected.
 * Zero real customer data is ever exposed to demo users.
 */

const DEMO_USER = {
  _id: 'demo-admin-0001',
  name: 'Demo Admin',
  email: 'demo@fittrack.com',
  role: 'admin',
  isDemo: true,
};

// ─── Members ──────────────────────────────────────────────────────────────────
const DEMO_MEMBERS = [
  { _id: 'dm1', name: 'Arjun Sharma',   email: 'arjun@demo.com',   phone: '9876543210', status: 'active',   joinDate: '2024-11-01', expiryDate: '2025-11-01', membershipPlan: { _id: 'dp1', name: 'Premium', price: 2999, duration: 12 }, trainerAssigned: { _id: 'dt1', name: 'Ravi Kumar', specialty: 'Strength' }, gender: 'Male',   age: 27, height: 175, weight: 72, bmi: 23.5, fitnessGoal: 'Muscle Gain' },
  { _id: 'dm2', name: 'Priya Verma',    email: 'priya@demo.com',   phone: '9876543211', status: 'active',   joinDate: '2025-01-15', expiryDate: '2026-01-15', membershipPlan: { _id: 'dp2', name: 'Standard', price: 1999, duration: 6  }, trainerAssigned: { _id: 'dt2', name: 'Sneha Nair',  specialty: 'Yoga'     }, gender: 'Female', age: 24, height: 162, weight: 55, bmi: 20.9, fitnessGoal: 'Weight Loss' },
  { _id: 'dm3', name: 'Karan Mehta',   email: 'karan@demo.com',   phone: '9876543212', status: 'inactive', joinDate: '2024-06-20', expiryDate: '2024-12-20', membershipPlan: { _id: 'dp3', name: 'Basic',    price: 999,  duration: 3  }, trainerAssigned: null,                                                                                     gender: 'Male',   age: 31, height: 180, weight: 90, bmi: 27.8, fitnessGoal: 'Endurance'   },
  { _id: 'dm4', name: 'Ananya Reddy',  email: 'ananya@demo.com',  phone: '9876543213', status: 'active',   joinDate: '2025-03-10', expiryDate: '2026-03-10', membershipPlan: { _id: 'dp1', name: 'Premium', price: 2999, duration: 12 }, trainerAssigned: { _id: 'dt1', name: 'Ravi Kumar', specialty: 'Strength' }, gender: 'Female', age: 22, height: 158, weight: 50, bmi: 20.0, fitnessGoal: 'Flexibility' },
  { _id: 'dm5', name: 'Vikram Singh',  email: 'vikram@demo.com',  phone: '9876543214', status: 'expired',  joinDate: '2024-02-01', expiryDate: '2025-02-01', membershipPlan: { _id: 'dp2', name: 'Standard', price: 1999, duration: 6  }, trainerAssigned: { _id: 'dt2', name: 'Sneha Nair',  specialty: 'Yoga'     }, gender: 'Male',   age: 35, height: 178, weight: 85, bmi: 26.8, fitnessGoal: 'Weight Loss' },
  { _id: 'dm6', name: 'Meera Joshi',   email: 'meera@demo.com',   phone: '9876543215', status: 'active',   joinDate: '2025-04-05', expiryDate: '2026-04-05', membershipPlan: { _id: 'dp3', name: 'Basic',    price: 999,  duration: 3  }, trainerAssigned: null,                                                                                     gender: 'Female', age: 28, height: 165, weight: 60, bmi: 22.0, fitnessGoal: 'General Fitness' },
  { _id: 'dm7', name: 'Rohit Kapoor',  email: 'rohit@demo.com',   phone: '9876543216', status: 'active',   joinDate: '2025-02-20', expiryDate: '2026-02-20', membershipPlan: { _id: 'dp1', name: 'Premium', price: 2999, duration: 12 }, trainerAssigned: { _id: 'dt1', name: 'Ravi Kumar', specialty: 'Strength' }, gender: 'Male',   age: 29, height: 182, weight: 88, bmi: 26.6, fitnessGoal: 'Muscle Gain' },
  { _id: 'dm8', name: 'Divya Pillai',  email: 'divya@demo.com',   phone: '9876543217', status: 'inactive', joinDate: '2024-09-15', expiryDate: '2025-03-15', membershipPlan: { _id: 'dp2', name: 'Standard', price: 1999, duration: 6  }, trainerAssigned: { _id: 'dt2', name: 'Sneha Nair',  specialty: 'Yoga'     }, gender: 'Female', age: 26, height: 160, weight: 58, bmi: 22.7, fitnessGoal: 'Flexibility' },
];

// ─── Trainers ─────────────────────────────────────────────────────────────────
const DEMO_TRAINERS = [
  { _id: 'dt1', name: 'Ravi Kumar',  email: 'ravi@demo.com',  phone: '9111111111', specialty: 'Strength Training', experience: 8, status: 'active', salary: 35000, joinDate: '2022-01-10', assignedMembers: ['dm1','dm4','dm7'] },
  { _id: 'dt2', name: 'Sneha Nair',  email: 'sneha@demo.com', phone: '9222222222', specialty: 'Yoga & Flexibility', experience: 5, status: 'active', salary: 28000, joinDate: '2023-03-15', assignedMembers: ['dm2','dm5','dm8'] },
  { _id: 'dt3', name: 'Aditya Rao',  email: 'aditya@demo.com',phone: '9333333333', specialty: 'Cardio & HIIT',      experience: 6, status: 'active', salary: 30000, joinDate: '2022-07-01', assignedMembers: [] },
];

// ─── Plans ────────────────────────────────────────────────────────────────────
const DEMO_PLANS = [
  { _id: 'dp1', name: 'Premium',  price: 2999, duration: 12, description: 'Full access — all classes, personal trainer, nutrition plan', features: ['Unlimited Classes', 'Personal Trainer', 'Nutrition Plan', 'Locker Room'], isActive: true },
  { _id: 'dp2', name: 'Standard', price: 1999, duration: 6,  description: 'Group classes + trainer consultation every month',          features: ['Group Classes', 'Monthly Consultation', 'Locker Room'],               isActive: true },
  { _id: 'dp3', name: 'Basic',    price: 999,  duration: 3,  description: 'Gym floor access with basic equipment',                      features: ['Gym Floor Access', 'Basic Equipment'],                                 isActive: true },
];

// ─── Payments ─────────────────────────────────────────────────────────────────
const DEMO_PAYMENTS = [
  { _id: 'dpay1', memberId: { _id: 'dm1', name: 'Arjun Sharma'  }, amount: 2999, status: 'paid', method: 'UPI',         date: '2024-11-01', plan: 'Premium'  },
  { _id: 'dpay2', memberId: { _id: 'dm2', name: 'Priya Verma'   }, amount: 1999, status: 'paid', method: 'Card',        date: '2025-01-15', plan: 'Standard' },
  { _id: 'dpay3', memberId: { _id: 'dm3', name: 'Karan Mehta'   }, amount: 999,  status: 'paid', method: 'Cash',        date: '2024-06-20', plan: 'Basic'    },
  { _id: 'dpay4', memberId: { _id: 'dm4', name: 'Ananya Reddy'  }, amount: 2999, status: 'paid', method: 'Net Banking', date: '2025-03-10', plan: 'Premium'  },
  { _id: 'dpay5', memberId: { _id: 'dm5', name: 'Vikram Singh'  }, amount: 1999, status: 'paid', method: 'UPI',         date: '2024-02-01', plan: 'Standard' },
  { _id: 'dpay6', memberId: { _id: 'dm6', name: 'Meera Joshi'   }, amount: 999,  status: 'paid', method: 'Card',        date: '2025-04-05', plan: 'Basic'    },
  { _id: 'dpay7', memberId: { _id: 'dm7', name: 'Rohit Kapoor'  }, amount: 2999, status: 'paid', method: 'UPI',         date: '2025-02-20', plan: 'Premium'  },
  { _id: 'dpay8', memberId: { _id: 'dm8', name: 'Divya Pillai'  }, amount: 1999, status: 'paid', method: 'Cash',        date: '2024-09-15', plan: 'Standard' },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
const DEMO_ANALYTICS = {
  metrics: {
    totalMembers: 8,
    activeMembers: 5,
    inactiveMembers: 2,
    totalRevenue: 15994,
    attendanceRate: 78,
  },
  charts: {
    planDistribution: [
      { name: 'Premium',  value: 3 },
      { name: 'Standard', value: 3 },
      { name: 'Basic',    value: 2 },
    ],
    revenueTrend: [
      { month: 'Dec', revenue: 1998  },
      { month: 'Jan', revenue: 3998  },
      { month: 'Feb', revenue: 2999  },
      { month: 'Mar', revenue: 3998  },
      { month: 'Apr', revenue: 1998  },
      { month: 'May', revenue: 2999  },
    ],
    attendanceTrend: [
      { date: '20 May', attendance: 4 },
      { date: '21 May', attendance: 6 },
      { date: '22 May', attendance: 5 },
      { date: '23 May', attendance: 7 },
      { date: '24 May', attendance: 3 },
      { date: '25 May', attendance: 8 },
      { date: '26 May', attendance: 5 },
    ],
  },
  panels: {
    recentMembers: [
      { _id: 'dm4', name: 'Ananya Reddy', email: 'ananya@demo.com', joinDate: '2025-03-10' },
      { _id: 'dm7', name: 'Rohit Kapoor', email: 'rohit@demo.com',  joinDate: '2025-02-20' },
      { _id: 'dm2', name: 'Priya Verma',  email: 'priya@demo.com',  joinDate: '2025-01-15' },
      { _id: 'dm6', name: 'Meera Joshi',  email: 'meera@demo.com',  joinDate: '2025-04-05' },
    ],
    recentActivity: [
      { _id: 'da1', memberId: { _id: 'dm1', name: 'Arjun Sharma'  }, markedAt: new Date().toISOString() },
      { _id: 'da2', memberId: { _id: 'dm4', name: 'Ananya Reddy'  }, markedAt: new Date().toISOString() },
      { _id: 'da3', memberId: { _id: 'dm2', name: 'Priya Verma'   }, markedAt: new Date().toISOString() },
    ],
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────────
const DEMO_ATTENDANCE = [
  { _id: 'dat1', memberId: { _id: 'dm1', name: 'Arjun Sharma' }, date: '2025-05-26', status: 'present', markedAt: new Date().toISOString() },
  { _id: 'dat2', memberId: { _id: 'dm2', name: 'Priya Verma'  }, date: '2025-05-26', status: 'absent',  markedAt: new Date().toISOString() },
  { _id: 'dat3', memberId: { _id: 'dm4', name: 'Ananya Reddy' }, date: '2025-05-26', status: 'present', markedAt: new Date().toISOString() },
  { _id: 'dat4', memberId: { _id: 'dm7', name: 'Rohit Kapoor' }, date: '2025-05-26', status: 'present', markedAt: new Date().toISOString() },
];

// ─── Notifications ────────────────────────────────────────────────────────────
const DEMO_NOTIFICATIONS = [
  { _id: 'dn1', message: 'Vikram Singh\'s membership expired on Feb 1, 2025.',         type: 'warning', isRead: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { _id: 'dn2', message: 'Ananya Reddy just joined with a Premium plan. 🎉',          type: 'success', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString()     },
  { _id: 'dn3', message: 'Payment of ₹2,999 received from Rohit Kapoor.',              type: 'success', isRead: true,  createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: 'dn4', message: 'Karan Mehta\'s account is inactive. Consider a follow-up.', type: 'info',    isRead: true,  createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

// ─── Subscriptions ────────────────────────────────────────────────────────────
const DEMO_SUBSCRIPTIONS = [
  { _id: 'ds1', memberId: { _id: 'dm1', name: 'Arjun Sharma' }, planId: { _id: 'dp1', name: 'Premium', price: 2999 }, status: 'approved', requestedAt: '2025-05-01', reviewedAt: '2025-05-02' },
  { _id: 'ds2', memberId: { _id: 'dm6', name: 'Meera Joshi'  }, planId: { _id: 'dp3', name: 'Basic',   price: 999  }, status: 'pending',  requestedAt: '2025-05-24', reviewedAt: null          },
];

// ─── Progress (for member view) ───────────────────────────────────────────────
const DEMO_PROGRESS = [
  { _id: 'dpr1', memberId: 'dm1', weight: 75, date: '2025-02-01' },
  { _id: 'dpr2', memberId: 'dm1', weight: 74, date: '2025-03-01' },
  { _id: 'dpr3', memberId: 'dm1', weight: 73, date: '2025-04-01' },
  { _id: 'dpr4', memberId: 'dm1', weight: 72, date: '2025-05-01' },
];

module.exports = {
  DEMO_USER,
  DEMO_MEMBERS,
  DEMO_TRAINERS,
  DEMO_PLANS,
  DEMO_PAYMENTS,
  DEMO_ANALYTICS,
  DEMO_ATTENDANCE,
  DEMO_NOTIFICATIONS,
  DEMO_SUBSCRIPTIONS,
  DEMO_PROGRESS,
};
