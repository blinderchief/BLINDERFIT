import { Rocket, Code, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Careers = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Careers</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">Build the future of AI-powered fitness</p>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <p className="text-base text-white/70">
            BlinderFit is an early-stage startup building the next generation of AI-powered personalized fitness. We're a small, fast-moving team solving real problems in a $12B+ market where most apps fail their users.
          </p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-4 tracking-wide">Why BlinderFit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Rocket, title: 'Early Stage Impact', desc: 'Shape the product from day one. Your work directly defines the user experience.' },
              { icon: Code, title: 'Cutting-Edge Tech', desc: 'Work with Google Gemini AI, real-time data pipelines, and modern web frameworks.' },
              { icon: Heart, title: 'Mission-Driven', desc: 'Build technology that genuinely helps people live healthier lives.' },
              { icon: Users, title: 'Remote-First', desc: 'Work from anywhere. We value output over hours and trust over micromanagement.' },
            ].map(v => (
              <div key={v.title} className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-5">
                <v.icon className="h-5 w-5 text-gold mb-3" />
                <h3 className="text-white text-sm mb-1">{v.title}</h3>
                <p className="text-xs">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Join Us</h2>
          <p>We're an early-stage team and not hiring for specific roles right now. But if you're passionate about health, AI, and building products that genuinely help people — we'd love to hear from you.</p>
          <p className="mt-3">
            Reach out at <span className="text-gold">careers@blinderfit.com</span> or connect with the founder on{' '}
            <a href="https://www.linkedin.com/in/suyash-kumar-singh/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">LinkedIn</a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-white/[0.06]">
        <Link to="/" className="text-gold text-xs hover:underline">← Back to Home</Link>
      </div>
    </div>
  </div>
);

export default Careers;
