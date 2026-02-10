import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  Dumbbell,
  Activity,
  BookOpen,
  Sparkles,
  Users,
  UserCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Target,
  TrendingUp,
  Shield,
  Check,
  X,
  Zap,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'suyashsingh.raebareli@gmail.com';

/* ────────────────────────────────────────────────────── */
/*  Feature data                                         */
/* ────────────────────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: 'FitMentor AI',
    desc: 'Your personal AI nutritionist & fitness advisor powered by Google Gemini. Get hyper-personalized diet plans, exercise routines, and real-time coaching through text and voice.',
    link: '/fitmentor',
    color: 'from-amber-500/20 to-yellow-600/10',
  },
  {
    icon: BarChart3,
    title: 'PulseHub Dashboard',
    desc: 'A command center for your health journey. Visualize BMI trends, calorie intake, workout streaks, and AI-generated insights — all in one beautiful dashboard.',
    link: '/pulsehub',
    color: 'from-blue-500/20 to-cyan-600/10',
  },
  {
    icon: Dumbbell,
    title: 'Fitness Plans',
    desc: 'Adaptive 30-day workout & nutrition programs built around your goals, body type, and daily schedule. Plans evolve as you progress.',
    link: '/fitness-plan',
    color: 'from-rose-500/20 to-pink-600/10',
  },
  {
    icon: Activity,
    title: 'Health Tracking',
    desc: 'Log meals, workouts, water intake, sleep, and vitals daily. Your data feeds the AI so every recommendation gets smarter over time.',
    link: '/tracking',
    color: 'from-green-500/20 to-emerald-600/10',
  },
  {
    icon: BookOpen,
    title: 'FitLearn',
    desc: 'Evidence-based articles, video guides, and micro-courses on nutrition science, injury prevention, and holistic wellness.',
    link: '/fitlearn',
    color: 'from-violet-500/20 to-purple-600/10',
  },
  {
    icon: Sparkles,
    title: 'MindShift',
    desc: 'Mental wellness tools — guided meditation, breathing exercises, motivational nudges, and perception training to keep you focused.',
    link: '/mindshift',
    color: 'from-teal-500/20 to-cyan-600/10',
  },
  {
    icon: Users,
    title: 'TribeVibe',
    desc: 'Join community challenges, share progress, find accountability partners, and draw inspiration from others on the same journey.',
    link: '/tribevibe',
    color: 'from-orange-500/20 to-amber-600/10',
  },
  {
    icon: UserCircle,
    title: 'MyZone',
    desc: 'Your personal space — profile, health history, achievements, and preferences all in one place. Full control over your data.',
    link: '/myzone',
    color: 'from-indigo-500/20 to-blue-600/10',
  },
];

const steps = [
  {
    num: '01',
    title: 'Complete Health Assessment',
    desc: 'Sign up and answer a quick health quiz — BMI, daily routines, dietary preferences, fitness goals, and medical history.',
    icon: Target,
  },
  {
    num: '02',
    title: 'Get Your AI Plan',
    desc: 'FitMentor AI analyzes your data and builds a personalized 30-day nutrition & workout plan backed by expert research.',
    icon: MessageSquare,
  },
  {
    num: '03',
    title: 'Track, Adapt & Transform',
    desc: 'Log daily progress, receive real-time adjustments, and watch your dashboard light up with results. The AI learns and evolves with you.',
    icon: TrendingUp,
  },
];

/* ────────────────────────────────────────────────────── */
/*  Mock App Preview Screens                             */
/* ────────────────────────────────────────────────────── */
const DashboardPreview = () => (
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl h-full flex flex-col">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">PULSEHUB DASHBOARD</span>
    </div>
    <div className="p-4 space-y-3 flex-1">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'BMI', val: '23.4', delta: '-1.2' },
          { label: 'Streak', val: '14d', delta: '+3' },
          { label: 'Calories', val: '1,840', delta: '-160' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1a1a] rounded p-2.5 text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest">{s.label}</p>
            <p className="text-lg font-semibold text-white mt-0.5" style={{ letterSpacing: '0.05em' }}>{s.val}</p>
            <p className="text-[9px] text-green-400">{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#1a1a1a] rounded p-3">
        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Weekly Progress</p>
        <div className="flex items-end gap-1 h-16">
          {[40, 55, 45, 70, 60, 80, 65].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-gold/60 to-gold/20" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[8px] text-gray-600 flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ChatPreview = () => (
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl h-full flex flex-col">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">FITMENTOR AI CHAT</span>
    </div>
    <div className="p-4 space-y-3 flex-1">
      <div className="flex justify-end">
        <div className="bg-gold/20 border border-gold/30 rounded-lg px-3 py-2 max-w-[75%]">
          <p className="text-xs text-gray-200">I want to lose 5 kg in 2 months. What should I eat today?</p>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 max-w-[80%]">
          <p className="text-xs text-gray-300">Based on your profile (BMI 26.1, desk job, vegetarian), here's your plan for today:</p>
          <ul className="text-xs text-gray-400 mt-1.5 space-y-0.5 list-disc ml-3">
            <li>Breakfast: Oats with almonds — 320 cal</li>
            <li>Lunch: Quinoa salad with paneer — 450 cal</li>
            <li>Snack: Green smoothie — 180 cal</li>
            <li>Dinner: Dal + 1 roti + salad — 400 cal</li>
          </ul>
          <p className="text-[10px] text-gold mt-2">✨ Predicted outcome: −0.6 kg this week</p>
        </div>
      </div>
    </div>
  </div>
);

const TrackingPreview = () => (
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl h-full flex flex-col">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">DAILY TRACKING</span>
    </div>
    <div className="p-4 space-y-2.5 flex-1">
      {[
        { label: 'Meals Logged', val: '3 / 4', pct: 75, clr: 'bg-gold' },
        { label: 'Water Intake', val: '2.1L / 3L', pct: 70, clr: 'bg-blue-400' },
        { label: 'Workout', val: '32 min / 45 min', pct: 71, clr: 'bg-green-400' },
        { label: 'Sleep', val: '7.2h / 8h', pct: 90, clr: 'bg-violet-400' },
      ].map((t) => (
        <div key={t.label} className="bg-[#1a1a1a] rounded p-2.5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-gray-400 tracking-wider uppercase">{t.label}</span>
            <span className="text-[10px] text-gray-300">{t.val}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${t.clr}`} style={{ width: `${t.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────── */
/*  Home Component                                       */
/* ────────────────────────────────────────────────────── */
const Home = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [visible, setVisible] = useState<Record<string, boolean>>({ hero: false });
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const timer = setTimeout(() => setVisible((p) => ({ ...p, hero: true })), 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((p) => ({ ...p, [e.target.id]: true }));
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    const ids = ['features', 'previews', 'howItWorks', 'comparison', 'waitlist'];
    const timeout = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          sectionRefs.current[id] = el;
          observer.observe(el);
        }
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(timeout);
      Object.values(sectionRefs.current).forEach((el) => el && observer.unobserve(el));
    };
  }, []);

  const reveal = (id: string) =>
    visible[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  return (
    <div className="overflow-hidden -mt-24">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-blue-900/5" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-32 pb-20">
          <div
            className={`transition-all duration-1000 ease-out ${
              visible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Beta badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8">
              <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs tracking-[0.2em] uppercase font-medium">
                Beta — Early Access
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-[1.1]"
              style={{ letterSpacing: '0.06em' }}>
              AI-Powered Fitness,{' '}
              <span className="text-gold">Personalized</span> for You
            </h1>

            <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed"
              style={{ letterSpacing: '0.02em' }}>
              BlinderFit combines Google Gemini AI with deep health data to build adaptive nutrition plans,
              personalized workouts, and real-time coaching — so every day moves you closer to your goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAdmin ? (
                <Link
                  to="/pulsehub"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <a
                    href="#waitlist"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                  >
                    Join the Waitlist <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-gray-600 text-gray-300 font-medium tracking-wider text-sm hover:border-gray-400 hover:text-white transition-all"
                  >
                    See What's Inside <ChevronRight className="h-4 w-4" />
                  </a>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-xs tracking-wider">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> HIPAA-Aligned Privacy
              </span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span>Powered by Google Gemini</span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span>100% of Your Data Drives Your Plan</span>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <a href="#features" className="text-gray-600 hover:text-gold transition-colors" aria-label="Scroll to features">
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" className="py-24 bg-black border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${reveal('features')}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ letterSpacing: '0.08em' }}>
              ONE PLATFORM, TOTAL TRANSFORMATION
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              From AI-powered coaching to community challenges — BlinderFit covers every dimension of your health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Link
                key={f.title}
                to={f.link}
                className={`group relative bg-[#111] border border-gray-800 rounded-lg p-6 hover:border-gold/30 transition-all duration-500 ${reveal('features')}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <f.icon className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-white text-sm font-medium tracking-wider mb-2 uppercase">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-gold text-[11px] tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ APP PREVIEWS ═══════════════ */}
      <section id="previews" className="py-24 bg-[#060606] border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-14 transition-all duration-700 ${reveal('previews')}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">See It in Action</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ letterSpacing: '0.08em' }}>
              A GLIMPSE INSIDE BLINDERFIT
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              AI-driven dashboards, conversational coaching, and daily habit tracking — all wrapped in a sleek dark interface.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${reveal('previews')}`}>
            <div className="flex flex-col" style={{ transitionDelay: '100ms' }}>
              <div className="flex-1">
                <DashboardPreview />
              </div>
              <p className="text-center text-gray-500 text-xs mt-3 tracking-wider uppercase">PulseHub Dashboard</p>
            </div>
            <div className="flex flex-col" style={{ transitionDelay: '200ms' }}>
              <div className="flex-1">
                <ChatPreview />
              </div>
              <p className="text-center text-gray-500 text-xs mt-3 tracking-wider uppercase">FitMentor AI Chat</p>
            </div>
            <div className="flex flex-col" style={{ transitionDelay: '300ms' }}>
              <div className="flex-1">
                <TrackingPreview />
              </div>
              <p className="text-center text-gray-500 text-xs mt-3 tracking-wider uppercase">Daily Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="howItWorks" className="py-24 bg-black border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-16 transition-all duration-700 ${reveal('howItWorks')}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white" style={{ letterSpacing: '0.08em' }}>
              HOW IT WORKS
            </h2>
          </div>

          <div className="space-y-8">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`flex items-start gap-6 transition-all duration-700 ${reveal('howItWorks')}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gold text-xs tracking-widest font-medium">{s.num}</span>
                    <h3 className="text-white text-base tracking-wider uppercase">{s.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY BLINDERFIT ═══════════════ */}
      <section id="comparison" className="py-24 bg-[#060606] border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-14 transition-all duration-700 ${reveal('comparison')}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">The Difference</p>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ letterSpacing: '0.08em' }}>
              WHY BLINDERFIT STANDS OUT
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Most fitness apps give you generic plans. BlinderFit learns who you are and evolves with you.
            </p>
          </div>

          <div className={`transition-all duration-700 ${reveal('comparison')}`}>
            {/* Comparison Table */}
            <div className="overflow-hidden rounded-lg border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#111]">
                    <th className="text-left px-5 py-4 text-gray-400 font-normal tracking-wider text-xs uppercase">Feature</th>
                    <th className="px-5 py-4 text-gray-400 font-normal tracking-wider text-xs uppercase text-center">Generic Apps</th>
                    <th className="px-5 py-4 text-gold font-medium tracking-wider text-xs uppercase text-center">BlinderFit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {[
                    ['AI-personalized meal plans', false, true],
                    ['Adapts in real-time to your progress', false, true],
                    ['Voice & text AI coaching', false, true],
                    ['Mental wellness integration', false, true],
                    ['Community challenges & accountability', false, true],
                    ['Single dashboard for all health data', false, true],
                    ['Cookie-cutter workout templates', true, false],
                    ['Data locked in silos', true, false],
                  ].map(([feature, generic, bf], i) => (
                    <tr key={i} className="bg-[#0a0a0a] hover:bg-[#111] transition-colors">
                      <td className="px-5 py-3.5 text-gray-300 text-xs">{feature as string}</td>
                      <td className="px-5 py-3.5 text-center">
                        {generic ? (
                          <Check className="h-4 w-4 text-gray-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-700 mx-auto" />
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {bf ? (
                          <Check className="h-4 w-4 text-gold mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-700 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key differentiators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Zap, title: 'Real-Time AI', desc: 'Plans adjust daily based on your tracked data' },
                { icon: Shield, title: 'Privacy First', desc: 'Your health data is encrypted and never sold' },
                { icon: Lock, title: 'Science-Backed', desc: 'Every recommendation grounded in research' },
              ].map((d) => (
                <div key={d.title} className="bg-[#111] border border-gray-800 rounded-lg p-5 text-center">
                  <d.icon className="h-6 w-6 text-gold mx-auto mb-3" />
                  <h4 className="text-white text-xs tracking-wider uppercase mb-1">{d.title}</h4>
                  <p className="text-gray-500 text-xs">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ JOIN WAITLIST ═══════════════ */}
      <section id="waitlist" className="py-24 bg-black border-t border-gray-900 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className={`transition-all duration-700 ${reveal('waitlist')}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs tracking-[0.2em] uppercase">Launching Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ letterSpacing: '0.08em' }}>
              BE THE FIRST TO EXPERIENCE IT
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              We're opening access to a limited group of early users. Join the waitlist to get priority access, exclusive beta features, and a founding member badge.
            </p>

            {/* Waitlist form */}
            <div className="max-w-md mx-auto">
              {waitlistStatus === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-4">
                  <Check className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 text-sm font-medium">You're on the list!</p>
                  <p className="text-green-400/70 text-xs mt-1">We'll notify you when early access opens.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (waitlistEmail.trim()) {
                      // Store in localStorage for now (can integrate backend later)
                      const existing = JSON.parse(localStorage.getItem('blinderfit_waitlist') || '[]');
                      if (!existing.includes(waitlistEmail.trim().toLowerCase())) {
                        existing.push(waitlistEmail.trim().toLowerCase());
                        localStorage.setItem('blinderfit_waitlist', JSON.stringify(existing));
                      }
                      setWaitlistStatus('success');
                      setWaitlistEmail('');
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-[#111] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all rounded-lg whitespace-nowrap"
                  >
                    Join Waitlist
                  </button>
                </form>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-xs tracking-wider">
              <div className="text-center">
                <p className="text-2xl font-light text-white mb-0.5">8+</p>
                <p className="uppercase">AI Features</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-800" />
              <div className="text-center">
                <p className="text-2xl font-light text-white mb-0.5">24/7</p>
                <p className="uppercase">AI Coaching</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-800" />
              <div className="text-center">
                <p className="text-2xl font-light text-white mb-0.5">100%</p>
                <p className="uppercase">Personalized</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-800" />
              <div className="text-center">
                <p className="text-2xl font-light text-white mb-0.5">Free</p>
                <p className="uppercase">Beta Access</p>
              </div>
            </div>

            {/* Founder note */}
            <div className="mt-12 bg-[#0d0d0d] border border-gray-800 rounded-lg p-6 text-left max-w-lg mx-auto">
              <p className="text-gray-400 text-xs leading-relaxed italic">
                "I built BlinderFit because I was tired of fitness apps that treat everyone the same. Your body is unique — your plan should be too. We're combining the latest in AI with real health science to create something that actually works for <span className="text-white">you</span>."
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold text-xs font-medium">SS</span>
                </div>
                <div>
                  <p className="text-white text-xs font-medium">Suyash Singh</p>
                  <p className="text-gray-500 text-[10px] tracking-wider uppercase">Founder, BlinderFit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
