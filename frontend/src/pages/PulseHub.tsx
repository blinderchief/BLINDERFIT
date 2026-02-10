import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import apiService from '@/services/api';
import {
  Dumbbell, Brain, Activity, Flame, Heart, Trophy, Target,
  CalendarDays, TrendingUp, Users, BookOpen, ChevronRight,
  Droplets, Moon, Zap, ArrowUpRight, Plus, Scale, Apple,
  Timer, BarChart3, Gauge, Sparkles, Shield, Clock
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart as RechartsBarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DashStats {
  workoutsCompleted: number;
  streak: number;
  caloriesBurned: number;
  activeMinutes: number;
  hydration: number;
  sleepHours: number;
  sleepQuality: number;
  heartRate: number;
  points: number;
  weeklyGoal: { current: number; target: number };
  bmi: number;
  weight: number;
  bodyFat: number;
  recoveryScore: number;
  stressLevel: number;
  vo2Max: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  caloriesConsumed: number;
  stepsToday: number;
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
  bmi: 0,
  weight: 0,
  bodyFat: 0,
  recoveryScore: 0,
  stressLevel: 0,
  vo2Max: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  caloriesConsumed: 0,
  stepsToday: 0,
};

/* ------------------------------------------------------------------ */
/*  Chart data (placeholder – swap with real API data)                 */
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

const monthlyProgress = [
  { week: 'W1', weight: 78.2, bmi: 24.8, body_fat: 22.1 },
  { week: 'W2', weight: 77.8, bmi: 24.6, body_fat: 21.8 },
  { week: 'W3', weight: 77.3, bmi: 24.5, body_fat: 21.4 },
  { week: 'W4', weight: 76.9, bmi: 24.3, body_fat: 21.0 },
];

const fitnessRadar = [
  { metric: 'Strength', value: 72 },
  { metric: 'Cardio', value: 65 },
  { metric: 'Flexibility', value: 48 },
  { metric: 'Balance', value: 55 },
  { metric: 'Recovery', value: 80 },
  { metric: 'Nutrition', value: 68 },
];

const sleepBreakdown = [
  { name: 'Deep', value: 22, color: '#4338ca' },
  { name: 'Light', value: 45, color: '#6366f1' },
  { name: 'REM', value: 25, color: '#818cf8' },
  { name: 'Awake', value: 8, color: '#1e1b4b' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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

const getBmiCategory = (bmi: number) => {
  if (bmi === 0) return { label: '—', color: 'text-white/40' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-sky-400' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
  return { label: 'Obese', color: 'text-red-400' };
};

const getRecoveryLabel = (score: number) => {
  if (score === 0) return { label: 'No data', color: 'text-white/40' };
  if (score >= 80) return { label: 'Optimal', color: 'text-emerald-400' };
  if (score >= 60) return { label: 'Good', color: 'text-green-400' };
  if (score >= 40) return { label: 'Moderate', color: 'text-amber-400' };
  return { label: 'Low', color: 'text-red-400' };
};

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  accent?: string;
}

const StatCard = ({ icon: Icon, label, value, sub, trend, accent = 'gold' }: StatCardProps) => (
  <div className="group relative bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-4 sm:p-5 hover:border-gold/30 transition-all duration-300">
    <div className="flex items-start justify-between mb-2 sm:mb-3">
      <span className="text-[11px] sm:text-[13px] text-white/50 font-medium tracking-wide">{label}</span>
      <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-${accent}-500/10 flex items-center justify-center`}>
        <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] text-${accent === 'gold' ? 'gold' : accent + '-400'}`} />
      </div>
    </div>
    <p className="text-xl sm:text-[28px] font-light text-white leading-none tracking-tight">{value}</p>
    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
      {trend !== undefined && (
        <span className={`text-[10px] sm:text-xs flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
      {sub && <span className="text-[10px] sm:text-xs text-white/30">{sub}</span>}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Metric Ring                                                        */
/* ------------------------------------------------------------------ */

const MetricRing = ({ value, max, color, size = 80, strokeWidth = 8 }: {
  value: number; max: number; color: string; size?: number; strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`}
        className="transition-all duration-700" />
    </svg>
  );
};

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
          {p.name}: <span className="text-white font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Weekly Goal Ring                                                    */
/* ------------------------------------------------------------------ */

const GoalRing = ({ current, target }: { current: number; target: number }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
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
  const [chartTab, setChartTab] = useState<'activity' | 'steps' | 'trends'>('activity');

  /* ---- Auth guard ---- */
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAuthReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  /* ---- Backend API data fetch ---- */
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchStats = async () => {
      try {
        const data: any = await apiService.getDashboardData();
        if (data) {
          setStats({
            workoutsCompleted: data.workoutsCompleted ?? 0,
            streak: data.streak ?? 0,
            caloriesBurned: data.caloriesBurned ?? 0,
            activeMinutes: data.activeMinutes ?? 0,
            hydration: data.hydration ?? 0,
            sleepHours: data.sleepHours ?? 0,
            sleepQuality: data.sleepQuality ?? 0,
            heartRate: data.heartRate ?? 0,
            points: data.points ?? 0,
            weeklyGoal: data.weeklyGoal ?? { current: 0, target: 5 },
            bmi: data.bmi ?? 0,
            weight: data.weight ?? 0,
            bodyFat: data.bodyFat ?? 0,
            recoveryScore: data.recoveryScore ?? 0,
            stressLevel: data.stressLevel ?? 0,
            vo2Max: data.vo2Max ?? 0,
            proteinG: data.proteinG ?? 0,
            carbsG: data.carbsG ?? 0,
            fatG: data.fatG ?? 0,
            caloriesConsumed: data.caloriesConsumed ?? 0,
            stepsToday: data.stepsToday ?? 0,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

  const bmiInfo = getBmiCategory(stats.bmi);
  const recoveryInfo = getRecoveryLabel(stats.recoveryScore);

  const totalMacros = stats.proteinG + stats.carbsG + stats.fatG;
  const macroData = totalMacros > 0 ? [
    { name: 'Protein', value: stats.proteinG, color: '#D4AF37' },
    { name: 'Carbs', value: stats.carbsG, color: '#6366f1' },
    { name: 'Fat', value: stats.fatG, color: '#f59e0b' },
  ] : [
    { name: 'Protein', value: 33, color: '#D4AF37' },
    { name: 'Carbs', value: 45, color: '#6366f1' },
    { name: 'Fat', value: 22, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* ========== HEADER ========== */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/40 mb-1">{today()}</p>
              <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                {greeting()}, <span className="text-gold">{user.displayName || 'there'}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
                <Trophy className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/70">{stats.points.toLocaleString()} pts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-white/70">{stats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className={`text-sm ${recoveryInfo.color}`}>{recoveryInfo.label}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ========== TOP STAT CARDS (6 cols) ========== */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard icon={Dumbbell} label="Workouts" value={stats.workoutsCompleted} sub="total" trend={12} />
          <StatCard icon={Flame} label="Burned" value={stats.caloriesBurned ? stats.caloriesBurned.toLocaleString() : '—'} sub="kcal" trend={8} accent="amber" />
          <StatCard icon={Heart} label="Heart Rate" value={stats.heartRate ? `${stats.heartRate}` : '—'} sub="bpm resting" accent="rose" />
          <StatCard icon={Activity} label="Active Min" value={stats.activeMinutes || '—'} sub="this week" trend={5} accent="emerald" />
          <StatCard icon={Scale} label="Weight" value={stats.weight ? `${stats.weight}` : '—'} sub="kg" trend={-1.2} accent="sky" />
          <StatCard icon={Gauge} label="BMI" value={stats.bmi ? stats.bmi.toFixed(1) : '—'} sub={bmiInfo.label} accent="violet" />
        </section>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ---------- LEFT COL (8/12) ---------- */}
          <div className="lg:col-span-8 space-y-6">

            {/* Activity / Steps / Trends Chart */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-6">
                <CardTitle className="text-base font-normal text-white/80">Weekly Overview</CardTitle>
                <div className="flex bg-white/[0.04] rounded-md p-0.5">
                  {(['activity', 'steps', 'trends'] as const).map(t => (
                    <button key={t} onClick={() => setChartTab(t)}
                      className={`px-3 py-1 text-xs rounded transition capitalize ${chartTab === t ? 'bg-gold/20 text-gold' : 'text-white/40 hover:text-white/60'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-4 pb-4">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartTab === 'activity' ? (
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
                    ) : chartTab === 'steps' ? (
                      <RechartsBarChart data={weekSteps} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="steps" name="Steps" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={28} />
                      </RechartsBarChart>
                    ) : (
                      <LineChart data={monthlyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="week" stroke="#555" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} />
                        <Line type="monotone" dataKey="body_fat" name="Body Fat %" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} strokeDasharray="4 4" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Body Metrics + Nutrition Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Body Composition & Recovery */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardHeader className="pb-2 pt-5 px-5">
                  <CardTitle className="text-sm font-normal text-white/80 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gold" /> Body & Recovery
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <MetricRing value={stats.bodyFat || 21} max={50} color="#D4AF37" size={72} strokeWidth={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-light text-white">{stats.bodyFat || 21}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1.5">Body Fat</p>
                    </div>
                    <div className="text-center">
                      <div className="relative inline-block">
                        <MetricRing value={stats.recoveryScore || 75} max={100} color="#10b981" size={72} strokeWidth={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-light text-white">{stats.recoveryScore || 75}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1.5">Recovery</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-white/40 mb-1">
                        <span>VO₂ Max</span>
                        <span>{stats.vo2Max || 42} ml/kg/min</span>
                      </div>
                      <Progress value={((stats.vo2Max || 42) / 60) * 100} className="h-1 bg-white/[0.06]" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-white/40 mb-1">
                        <span>Stress Level</span>
                        <span>{stats.stressLevel || 32}/100</span>
                      </div>
                      <Progress value={stats.stressLevel || 32} className="h-1 bg-white/[0.06]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Macros */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardHeader className="pb-2 pt-5 px-5">
                  <CardTitle className="text-sm font-normal text-white/80 flex items-center gap-2">
                    <Apple className="h-4 w-4 text-gold" /> Nutrition Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-20 h-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={macroData} cx="50%" cy="50%" innerRadius={22} outerRadius={36}
                            paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {macroData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-light text-white">{stats.caloriesConsumed || '—'}</p>
                      <p className="text-[10px] text-white/40">kcal consumed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {macroData.map(m => (
                      <div key={m.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-[11px] text-white/50 flex-1">{m.name}</span>
                        <span className="text-[11px] text-white/70">{m.value}g</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    <MetricRing value={stats.hydration} max={100} color="#38bdf8" size={80} strokeWidth={8} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-light text-white">{stats.hydration}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-white/30">of daily goal</p>
                </CardContent>
              </Card>

              {/* Sleep with breakdown */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm text-white/50">Sleep</span>
                  </div>
                  <p className="text-2xl font-light text-white text-center mb-2">
                    {stats.sleepHours || '—'}<span className="text-sm text-white/30 ml-1">hrs</span>
                  </p>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
                    {sleepBreakdown.map(s => (
                      <div key={s.name} className="h-full" style={{ width: `${s.value}%`, background: s.color }} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {sleepBreakdown.map(s => (
                      <div key={s.name} className="text-center">
                        <div className="w-1.5 h-1.5 rounded-full mx-auto mb-0.5" style={{ background: s.color }} />
                        <span className="text-[8px] text-white/30">{s.name}</span>
                      </div>
                    ))}
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

            {/* Steps + Fitness Score Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Today's Steps */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-white/50">Today's Steps</span>
                    </div>
                    <span className="text-[10px] text-white/30">Goal: 10,000</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <p className="text-3xl font-light text-white">{(stats.stepsToday || 0).toLocaleString()}</p>
                    <div className="flex-1 mb-1">
                      <Progress value={Math.min(((stats.stepsToday || 0) / 10000) * 100, 100)} className="h-2 bg-white/[0.06]" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    {Math.max(0, 10000 - (stats.stepsToday || 0)).toLocaleString()} steps remaining
                  </p>
                </CardContent>
              </Card>

              {/* Fitness Score Radar */}
              <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span className="text-sm text-white/50">Fitness Score</span>
                  </div>
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={fitnessRadar} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#222" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#666' }} />
                        <Radar name="Score" dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.15} strokeWidth={1.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Assessment CTA */}
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

          {/* ---------- RIGHT SIDEBAR (4/12) ---------- */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Actions */}
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
                <CardTitle className="text-base font-normal text-white/80 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" />
                  Today's Focus
                </CardTitle>
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

            {/* AI Insights */}
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
                  <p className="text-[11px] text-white/40">Your recovery score is high — great day for an intense session.</p>
                </div>
                <div className="bg-amber-500/[0.06] border border-amber-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-amber-400 font-medium mb-0.5">Nutrition Tip</p>
                  <p className="text-[11px] text-white/40">Protein intake is on track. Consider adding more fiber today.</p>
                </div>
                <div className="bg-sky-500/[0.06] border border-sky-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-sky-400 font-medium mb-0.5">Sleep Insight</p>
                  <p className="text-[11px] text-white/40">Deep sleep was 22% — above average. Keep your sleep schedule consistent.</p>
                </div>
                <div className="bg-violet-500/[0.06] border border-violet-500/10 rounded-md px-3 py-2.5">
                  <p className="text-xs text-violet-400 font-medium mb-0.5">Stress Alert</p>
                  <p className="text-[11px] text-white/40">Stress level is moderate. Try a 10-min MindShift session after lunch.</p>
                </div>
                <Link
                  to="/fitmentor"
                  className="flex items-center gap-2 text-xs text-gold hover:underline pt-1"
                >
                  Talk to AI Coach <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card className="bg-[#0D0D0D] border-white/[0.06] rounded-lg">
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-base font-normal text-white/80 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gold" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                {[
                  { label: 'Workouts Done', val: `${stats.weeklyGoal.current}/${stats.weeklyGoal.target}`, pct: weeklyPct, color: '#D4AF37' },
                  { label: 'Avg Sleep', val: `${stats.sleepHours || '—'}h`, pct: ((stats.sleepHours || 0) / 8) * 100, color: '#6366f1' },
                  { label: 'Avg Hydration', val: `${stats.hydration}%`, pct: stats.hydration, color: '#38bdf8' },
                  { label: 'Active Minutes', val: `${stats.activeMinutes || 0}`, pct: Math.min(((stats.activeMinutes || 0) / 300) * 100, 100), color: '#10b981' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>{item.label}</span>
                      <span className="text-white/60">{item.val}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(item.pct, 100)}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseHub;
