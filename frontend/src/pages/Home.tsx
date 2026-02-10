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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">PULSEHUB DASHBOARD</span>
    </div>
    <div className="p-4 space-y-3">
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
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">FITMENTOR AI CHAT</span>
    </div>
    <div className="p-4 space-y-3 min-h-[180px]">
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
  <div className="bg-[#0d0d0d] rounded-lg border border-gray-800 overflow-hidden shadow-2xl">
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#161616] border-b border-gray-800">
      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      <span className="ml-3 text-[10px] text-gray-500 tracking-wider">DAILY TRACKING</span>
    </div>
    <div className="p-4 space-y-2.5">
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
  const [visible, setVisible] = useState<Record<string, boolean>>({ hero: false });
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

    const ids = ['features', 'previews', 'howItWorks', 'cta'];
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
              {user ? (
                <Link
                  to="/pulsehub"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/fitmentor"
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-gray-600 text-gray-300 font-medium tracking-wider text-sm hover:border-gray-400 hover:text-white transition-all"
                  >
                    Try FitMentor AI <ChevronRight className="h-4 w-4" />
                  </Link>
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
            <div style={{ transitionDelay: '100ms' }}>
              <DashboardPreview />
              <p className="text-center text-gray-500 text-xs mt-3 tracking-wider uppercase">PulseHub Dashboard</p>
            </div>
            <div style={{ transitionDelay: '200ms' }}>
              <ChatPreview />
              <p className="text-center text-gray-500 text-xs mt-3 tracking-wider uppercase">FitMentor AI Chat</p>
            </div>
            <div style={{ transitionDelay: '300ms' }}>
              <TrackingPreview />
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

      {/* ═══════════════ CTA ═══════════════ */}
      <section id="cta" className="py-24 bg-[#060606] border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className={`transition-all duration-700 ${reveal('cta')}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs tracking-[0.2em] uppercase">Now in Beta</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-4" style={{ letterSpacing: '0.08em' }}>
              START YOUR TRANSFORMATION TODAY
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Join BlinderFit's early access program and be among the first to experience AI-powered fitness coaching that truly adapts to you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/pulsehub"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-black font-medium tracking-wider text-sm hover:bg-gold/90 transition-all"
                  >
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-gray-600 text-gray-300 font-medium tracking-wider text-sm hover:border-gray-400 hover:text-white transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
