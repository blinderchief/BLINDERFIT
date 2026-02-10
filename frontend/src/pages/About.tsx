
import { useState, useEffect } from 'react';
import { Activity, Award, Heart, TrendingUp, Users, Zap, Shield, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-gold" />,
      title: "Health First",
      description: "Every recommendation prioritizes your wellbeing. We consider physical, mental, and nutritional health as one interconnected system."
    },
    {
      icon: <Brain className="h-8 w-8 text-gold" />,
      title: "AI That Adapts",
      description: "Powered by Google Gemini, our AI learns from your data and evolves your plan daily — not monthly, not weekly."
    },
    {
      icon: <Shield className="h-8 w-8 text-gold" />,
      title: "Privacy by Design",
      description: "Your health data is encrypted and never sold. We build with HIPAA-aligned practices and transparent data policies."
    },
    {
      icon: <Activity className="h-8 w-8 text-gold" />,
      title: "Personalization",
      description: "No two bodies are the same. Our plans account for your BMI, goals, diet, lifestyle, medical history, and daily progress."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-gold" />,
      title: "Science-Backed",
      description: "Every feature is grounded in exercise science, nutrition research, and behavioral psychology. No fads, no guesswork."
    },
    {
      icon: <Users className="h-8 w-8 text-gold" />,
      title: "Inclusive Design",
      description: "Built for everyone — seniors, beginners, athletes, and professionals. Accessibility and inclusivity are core to our product."
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
              AI-Powered Fitness That <span className="text-gold">Actually Works</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              In a $12B+ market where 92% of fitness app users quit within 30 days, we're building the platform that makes personalized health accessible, adaptive, and effective.
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
              Democratize Personalized Fitness Through AI
            </h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                Most fitness apps treat you like a data point — offering the same workout templates and generic meal plans to everyone. That's why people give up. BlinderFit is different.
              </p>
              <p>
                We combine Google Gemini AI with deep health data — your BMI, dietary preferences, medical history, sleep patterns, stress levels, and daily progress — to build plans that adapt in real time. Your plan yesterday isn't your plan today, because you're not the same person today.
              </p>
              <p>
                Our goal is simple: make the kind of personalized health coaching that was once reserved for elite athletes available to everyone, everywhere.
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
              A Market That Needs Disruption
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
            Sources: Grand View Research, Business of Apps (2024), CDC NHANES (2023). The market is projected to reach $32–45B by 2033.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-black border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-8">Founder</p>
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-gold text-xl font-medium">SS</span>
          </div>
          <h3 className="text-white text-lg mb-1">Suyash Singh</h3>
          <p className="text-gray-500 text-xs tracking-wider uppercase mb-6">Founder & Builder</p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto italic">
            "I started BlinderFit because fitness apps kept failing me. They all gave the same plans regardless of who I was. I knew AI could do better — could truly understand each person and adapt. That's what we're building."
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#060606] border-t border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-light text-white mb-4 tracking-wide">Join Us on This Journey</h2>
          <p className="text-gray-400 text-sm mb-8">Whether you're an early user, a potential teammate, or a partner — we'd love to connect.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/#waitlist" className="px-8 py-3 bg-gold text-black text-sm font-medium tracking-wider hover:bg-gold/90 transition rounded-lg">
              Join the Waitlist
            </Link>
            <Link to="/careers" className="px-8 py-3 border border-gray-600 text-gray-300 text-sm tracking-wider hover:border-gray-400 hover:text-white transition rounded-lg">
              View Careers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
