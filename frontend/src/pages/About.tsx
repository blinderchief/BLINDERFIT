
import { useState, useEffect } from 'react';
import { Activity, Award, Heart, TrendingUp, Users, Zap, Shield, Brain, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-gold" />,
      title: "Solve Real Pain",
      description: "Data friction, execution anxiety, and shame-inducing tracking are why people quit. Every feature we build targets a real behavioral barrier, not a vanity metric."
    },
    {
      icon: <Brain className="h-8 w-8 text-gold" />,
      title: "Long-Context AI",
      description: "Gemini's 2M-token context window ingests your entire health history — years of data, blood tests, habits — for clinical-grade personalization no chatbot can match."
    },
    {
      icon: <Shield className="h-8 w-8 text-gold" />,
      title: "Privacy by Design",
      description: "HIPAA-aligned encryption, GDPR-ready architecture. Your health data is never sold, never shared. Privacy isn't a feature — it's the foundation."
    },
    {
      icon: <Activity className="h-8 w-8 text-gold" />,
      title: "Multimodal Engine",
      description: "Photo-to-macro nutrition logging, video-based form correction, voice coaching — Gemini's native multimodality eliminates the friction that kills retention."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-gold" />,
      title: "Science-Backed",
      description: "Every recommendation grounded in exercise science, nutrition research, and behavioral psychology. Cycle-syncing, HRV adaptation, and recovery-aware programming."
    },
    {
      icon: <Users className="h-8 w-8 text-gold" />,
      title: "Inclusive Design",
      description: "Built for demographics that generic apps ignore — seniors (active aging & fall prevention), women's hormonal health (PCOS, menopause), and GLP-1 medication users."
    },
  ];

  const reveal = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="py-24 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className={`transition-all duration-1000 ease-out ${reveal}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">About BlinderFit</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-6 leading-tight" style={{ letterSpacing: '0.06em' }}>
              AI-Powered Fitness That <span className="text-gold">Actually Adapts</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              In a $12B+ market where 92% of fitness app users quit within 30 days, the "generalist AI coach" problem is solved by incumbents. We're building what they can't — a deep, multimodal health engine that sees you, remembers you, and adapts to your real life.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#060606] border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className={`transition-all duration-1000 ease-out ${reveal}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">Our Mission</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 tracking-wide">
              Beyond the "AI Wrapper" — A True Health Engine
            </h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                The fitness app market is flooded with LLM wrappers that generate generic workout text. Google Fitbit already bundles Gemini-powered coaching for free. Fitbod uses 400M+ data points for strength. Whoop owns recovery. The middle is dead.
              </p>
              <p>
                BlinderFit isn't competing in the middle. We're leveraging Gemini's unique strengths — a 2-million-token context window and native multimodality (vision, voice, text) — to build what incumbents structurally can't: a health engine that ingests your entire clinical history, analyzes photos and video for form correction and nutrition logging, and adapts daily based on sleep, stress, hormonal cycles, and recovery.
              </p>
              <p>
                Users don't churn because they lack a workout plan. They churn because of data friction, execution anxiety, and shame-inducing quantified tracking. We're solving the real problems: friction-free logging, AI-powered form correction, empathetic coaching, and inclusive design for underserved demographics like seniors, women with PCOS, and GLP-1 medication users.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-14 transition-all duration-1000 ease-out ${reveal}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Core Values</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-wide">
              What We Stand For
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-7 hover:border-gold/20 transition-all duration-500 ${reveal}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-5">{value.icon}</div>
                <h3 className="text-white text-sm font-medium tracking-wider uppercase mb-3">{value.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Context */}
      <section className="py-20 bg-[#060606] border-t border-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className={`text-center mb-12 transition-all duration-1000 ease-out ${reveal}`}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">The Opportunity</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-wide">
              A $45B Market by 2035
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { stat: '$12B+', label: 'Global market (2025)' },
              { stat: '345M', label: 'Fitness app users' },
              { stat: '3-8%', label: '30-day retention' },
              { stat: '40.3%', label: 'US adult obesity' },
            ].map(item => (
              <div key={item.label} className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-5 text-center">
                <p className="text-2xl font-light text-gold mb-1">{item.stat}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs text-center mt-6 leading-relaxed max-w-lg mx-auto">
            Sources: Grand View Research, Business of Apps (2024), CDC NHANES (2023), Towards Healthcare. CAGR 13.4–14.6%. North America holds ~40–45% global share.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-8">Founder</p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto italic mb-6">
            "I started BlinderFit because fitness apps kept failing me. They all gave the same plans regardless of who I was. I knew AI could do better — could truly understand each person and adapt. That's what we're building."
          </p>
          <a
            href="https://www.linkedin.com/in/suyash-kumar-singh/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gold text-xs tracking-wider hover:underline transition-colors"
          >
            <Linkedin className="h-4 w-4" /> Founder, BlinderFit
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#060606] border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-light text-white mb-4 tracking-wide">Join Us on This Journey</h2>
          <p className="text-gray-400 text-sm mb-8">Whether you're an early user or a potential partner — we'd love to connect.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/#waitlist" className="px-8 py-3 bg-gold text-black text-sm font-medium tracking-wider hover:bg-gold/90 transition rounded-lg">
              Join the Waitlist
            </Link>
            <a
              href="https://www.linkedin.com/in/suyash-kumar-singh/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-gray-600 text-gray-300 text-sm tracking-wider hover:border-gray-400 hover:text-white transition rounded-lg inline-flex items-center gap-2"
            >
              <Linkedin className="h-4 w-4" /> Connect on LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
