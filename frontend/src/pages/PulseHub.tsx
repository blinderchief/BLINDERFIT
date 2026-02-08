import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { db } from '@/integrations/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Dumbbell, Brain, Activity, Flame, Heart, Trophy, Target,
  CalendarDays, TrendingUp, Users, BookOpen, ChevronRight,
  Droplets, Moon, Zap, ArrowUpRight, Plus
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart as RechartsBarChart, Bar
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashStats {
  workoutsCompleted: number;
  streak: number;
  caloriesBurned: number;
  activeMinutes: number;
  hydration: number;       // 0-100
  sleepHours: number;
  sleepQuality: number;    // 0-100
  heartRate: number;
  points: number;
  weeklyGoal: { current: number; target: number };
}

const DEFAULT_STATS: DashStats = {
  workoutsCompleted: 0,
  streak: 0,
  caloriesBurned: 0,
  activeMinutes: 0,
  hydration: 0,
  sleepHours: 0,
  sleepQuality: 0,
  heartRate: 0,
  points: 0,
  weeklyGoal: { current: 0, target: 5 },
};

/* ------------------------------------------------------------------ */
/*  Chart data (placeholder – swap with real Firestore data)           */
/* ------------------------------------------------------------------ */

const weekActivity = [
  { day: 'Mon', cal: 420, min: 48 },
  { day: 'Tue', cal: 380, min: 42 },
  { day: 'Wed', cal: 520, min: 58 },
  { day: 'Thu', cal: 310, min: 35 },
  { day: 'Fri', cal: 480, min: 52 },
  { day: 'Sat', cal: 560, min: 64 },
  { day: 'Sun', cal: 200, min: 22 },
];

const weekSteps = [
  { day: 'Mon', steps: 8245 },
  { day: 'Tue', steps: 7500 },
  { day: 'Wed', steps: 9800 },
  { day: 'Thu', steps: 6500 },
  { day: 'Fri', steps: 10200 },
  { day: 'Sat', steps: 11500 },
  { day: 'Sun', steps: 5600 },
];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const today = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;          // positive = up, negative = down
  accent?: string;         // tailwind color token e.g. "emerald"
}

const StatCard = ({ icon: Icon, label, value, sub, trend, accent = 'gold' }: StatCardProps) => (
  <div className="group relative bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-5 hover:border-gold/30 transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <span className="text-[13px] text-white/50 font-medium tracking-wide">{label}</span>
      <div className={`h-9 w-9 rounded-lg bg-${accent}-500/10 flex items-center justify-center`}>
        <Icon className={`h-[18px] w-[18px] text-${accent === 'gold' ? 'gold' : accent + '-400'}`} />
      </div>
    </div>
    <p className="text-[28px] font-light text-white leading-none tracking-tight">{value}</p>
    <div className="flex items-center gap-2 mt-2">
      {trend !== undefined && (
        <span className={`text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
      {sub && <span className="text-xs text-white/30">{sub}</span>}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Quick Link                                                         */
/* ------------------------------------------------------------------ */

const QuickLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-gold/30 hover:bg-gold/[0.04] transition-all group"
  >
    <Icon className="h-5 w-5 text-gold/80 group-hover:text-gold transition-colors" />
    <span className="text-sm text-white/70 group-hover:text-white transition-colors flex-1">{label}</span>
    <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-gold/60 transition-colors" />
  </Link>
);

/* ------------------------------------------------------------------ */
/*  Chart Tooltip                                                      */
/* ------------------------------------------------------------------ */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-white/80">
          {p.name}: <span className="text-white font-medium">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Weekly Goal Ring                                                    */
/* ------------------------------------------------------------------ */

const GoalRing = ({ current, target }: { current: number; target: number }) => {
  const pct = Math.min((current / target) * 100, 100);
  const dash = (pct / 100) * 251.2;
  return (
    <div className="relative h-28 w-28 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke="#D4AF37" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${dash} ${251.2 - dash}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-light text-white">{current}/{target}</span>
        <span className="text-[10px] text-white/40 uppercase tracking-wider">workouts</span>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  MAIN DASHBOARD                                                     */
/* ================================================================== */

const PulseHub = () => {
  const { user } = useAuth();
  const { hasSubmittedHealthData } = useHealthData();
  const _navigate = useNavigate();

  const [stats, setStats] = useState<DashStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'activity' | 'steps'>('activity');

  /* ---- Auth guard ---- */
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAuthReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  /* ---- Firestore real-time sync ---- */
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const ref = doc(db, 'users', user.uid);
    const timeout = setTimeout(() => setLoading(false), 8000);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        clearTimeout(timeout);
        if (snap.exists()) {
          const d = snap.data();
          setStats({
            workoutsCompleted: d.workoutsCompleted ?? d.stats?.workoutCompleted ?? 0,
            streak: d.streak ?? d.stats?.daysStreak ?? 0,
            caloriesBurned: d.caloriesBurned ?? 0,
            activeMinutes: d.activeMinutes ?? 0,
            hydration: d.hydration ?? 0,
            sleepHours: d.sleepHours ?? 0,
            sleepQuality: d.sleepQuality ?? 0,
            heartRate: d.heartRate ?? d.stats?.heartRate?.current ?? 0,
            points: d.points ?? d.stats?.totalPoints ?? 0,
            weeklyGoal: d.weeklyGoal ?? { current: 0, target: 5 },
          });
        }
        setLoading(false);
      },
      () => { clearTimeout(timeout); setLoading(false); }
    );

    return () => { clearTimeout(timeout); unsub(); };
  }, [user]);

  /* ---- Loading / no-auth states ---- */
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          <span className="text-sm text-white/40">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6 px-6">
        <h2 className="text-2xl font-light text-white tracking-wide">Sign in to continue</h2>
        <p className="text-sm text-white/40 text-center max-w-sm">
          Access your personalized dashboard, AI coaching and progress tracking.
        </p>
        <div className="flex gap-3">
          <Link to="/login" className="px-6 py-2.5 border border-gold/40 text-gold text-sm rounded hover:bg-gold/10 transition">Log In</Link>
          <Link to="/register" className="px-6 py-2.5 bg-gold text-black text-sm rounded hover:bg-gold/90 transition font-medium">Get Started</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          <span className="text-sm text-white/40">Loading your data…</span>
        </div>
      </div>
    );
  }

  const weeklyPct = stats.weeklyGoal.target > 0
    ? Math.round((stats.weeklyGoal.current / stats.weeklyGoal.target) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========== HEADER ========== */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/40 mb-1">{today()}</p>
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {greeting()}, <span className="text-gold">{user.displayName || 'there'}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
                <Trophy className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/70">{stats.points.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white/70">{stats.streak} day streak</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========== STAT CARDS ========== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Dumbbell} label="Workouts" value={stats.workoutsCompleted} sub="total sessions" trend={12} />
          <StatCard icon={Flame} label="Calories" value={stats.caloriesBurned.toLocaleString()} sub="kcal burned" trend={8} accent="amber" />
          <StatCard icon={Heart} label="Heart Rate" value={stats.heartRate ? `${stats.heartRate} bpm` : '—'} sub="resting avg" accent="rose" />
          <StatCard icon={Activity} label="Active Min" value={stats.activeMinutes} sub="this week" trend={5} accent="emerald" />
        </section>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ---------- LEFT: Charts ---------- */}
          <div className="lg:col-span-8 space-y-6">

            {/* Activity / Steps Chart */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-6">
                <CardTitle className="text-base font-normal text-white/80">Weekly Overview</CardTitle>
                <div className="flex bg-white/[0.04] rounded-md p-0.5">
                  <button
                    onClick={() => setTab('activity')}
                    className={`px-3 py-1 text-xs rounded transition ${tab === 'activity' ? 'bg-gold/20 text-gold' : 'text-white/40 hover:text-white/60'}`}
                  >Activity</button>
                  <button
                    onClick={() => setTab('steps')}
                    className={`px-3 py-1 text-xs rounded transition ${tab === 'steps' ? 'bg-gold/20 text-gold' : 'text-white/40 hover:text-white/60'}`}
                  >Steps</button>
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-4 pb-4">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {tab === 'activity' ? (
                      <AreaChart data={weekActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gCal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="cal" name="Calories" stroke="#D4AF37" fill="url(#gCal)" strokeWidth={2} />
                        <Area type="monotone" dataKey="min" name="Minutes" stroke="#6366f1" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                      </AreaChart>
                    ) : (
                      <RechartsBarChart data={weekSteps} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="steps" name="Steps" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={28} />
                      </RechartsBarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Wellness Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Hydration */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplets className="h-4 w-4 text-sky-400" />
                    <span className="text-sm text-white/50">Hydration</span>
                  </div>
                  <div className="relative h-20 w-20 mx-auto mb-3">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(stats.hydration / 100) * 251.2} ${251.2 - (stats.hydration / 100) * 251.2}`}
                        className="transition-all duration-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-light text-white">{stats.hydration}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-white/30">of daily goal</p>
                </CardContent>
              </Card>

              {/* Sleep */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm text-white/50">Sleep</span>
                  </div>
                  <p className="text-3xl font-light text-white text-center mb-1">
                    {stats.sleepHours || '—'}<span className="text-sm text-white/30 ml-1">hrs</span>
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-white/30 mb-1">
                      <span>Quality</span>
                      <span>{stats.sleepQuality}%</span>
                    </div>
                    <Progress value={stats.sleepQuality} className="h-1 bg-white/[0.06]" indicatorClassName="bg-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Goal */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-gold" />
                    <span className="text-sm text-white/50">Weekly Goal</span>
                  </div>
                  <GoalRing current={stats.weeklyGoal.current} target={stats.weeklyGoal.target} />
                  <p className="text-xs text-center text-white/30 mt-2">{weeklyPct}% complete</p>
                </CardContent>
              </Card>
            </div>

            {/* Health Assessment CTA (show if no health data) */}
            {!hasSubmittedHealthData && (
              <Card className="bg-gradient-to-r from-gold/[0.08] to-transparent border-gold/20 rounded-lg overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Zap className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-white font-medium mb-1">Complete your health assessment</h3>
                    <p className="text-sm text-white/40">Get AI-powered personalized plans tailored to your goals and body.</p>
                  </div>
                  <Link
                    to="/health-form"
                    className="px-5 py-2.5 bg-gold text-black text-sm font-medium rounded hover:bg-gold/90 transition shrink-0"
                  >
                    Start Now
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ---------- RIGHT: Sidebar ---------- */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Links */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-normal text-white/80">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <QuickLink to="/fitmentor" icon={Brain} label="AI Coach" />
                <QuickLink to="/tracking" icon={Activity} label="Daily Tracking" />
                <QuickLink to="/fitness-plan" icon={Dumbbell} label="Fitness Plan" />
                <QuickLink to="/fitlearn" icon={BookOpen} label="Learn" />
                <QuickLink to="/tribevibe" icon={Users} label="Community" />
                <QuickLink to="/assessment-goals" icon={Target} label="Goals" />
                <QuickLink to="/myzone" icon={CalendarDays} label="My Zone" />
              </CardContent>
            </Card>

            {/* Today's Focus */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-base font-normal text-white/80">Today's Focus</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Dumbbell className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 font-medium">Upper Body Strength</p>
                    <p className="text-xs text-white/30">45 min · Moderate intensity</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Droplets className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 font-medium">Drink 8 glasses of water</p>
                    <p className="text-xs text-white/30">Stay hydrated throughout the day</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Moon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 font-medium">8 hours sleep target</p>
                    <p className="text-xs text-white/30">Wind down by 10:30 PM</p>
                  </div>
                </div>

                <Link
                  to="/fitness-plan"
                  className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 border border-gold/30 text-gold text-sm rounded hover:bg-gold/[0.06] transition"
                >
                  <Plus className="h-4 w-4" />
                  View Full Plan
                </Link>
              </CardContent>
            </Card>

            {/* AI Insights (compact) */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-base font-normal text-white/80 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gold" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <div className="bg-emerald-500/[0.06] border border-emerald-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-emerald-400 font-medium mb-0.5">Recovery Optimal</p>
                  <p className="text-[11px] text-white/40">You're well-rested and ready for an intense session.</p>
                </div>
                <div className="bg-amber-500/[0.06] border border-amber-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-amber-400 font-medium mb-0.5">Hydration Reminder</p>
                  <p className="text-[11px] text-white/40">Increase water intake – you're 35% below target.</p>
                </div>
                <div className="bg-sky-500/[0.06] border border-sky-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-sky-400 font-medium mb-0.5">Sleep Insight</p>
                  <p className="text-[11px] text-white/40">Your sleep quality improved 12% this week. Keep it up.</p>
                </div>

                <Link
                  to="/fitmentor"
                  className="flex items-center gap-2 text-xs text-gold hover:underline pt-1"
                >
                  Talk to AI Coach <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseHub;











