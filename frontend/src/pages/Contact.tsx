import { Mail, MapPin, MessageSquare } from 'lucide-react';

const Contact = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Contact Us</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">We'd love to hear from you</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-6 text-center">
          <Mail className="h-6 w-6 text-gold mx-auto mb-3" />
          <h3 className="text-white text-sm mb-1">Email</h3>
          <p className="text-white/40 text-xs">hello@blinderfit.com</p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-6 text-center">
          <MessageSquare className="h-6 w-6 text-gold mx-auto mb-3" />
          <h3 className="text-white text-sm mb-1">AI Chat</h3>
          <p className="text-white/40 text-xs">Use FitMentor anytime</p>
        </div>
        <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg p-6 text-center">
          <MapPin className="h-6 w-6 text-gold mx-auto mb-3" />
          <h3 className="text-white text-sm mb-1">Location</h3>
          <p className="text-white/40 text-xs">India (Remote-first)</p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Get in Touch</h2>
          <p>For general inquiries, partnership proposals, feedback, or support, email us at <span className="text-gold">hello@blinderfit.com</span>. We aim to respond within 48 hours.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">For Specific Topics</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-gold text-xs mt-0.5">→</span>
              <div>
                <strong className="text-white/80">Bug Reports & Feature Requests</strong>
                <p className="text-xs mt-0.5">We're in beta and actively improving. Share your experiences at feedback@blinderfit.com.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold text-xs mt-0.5">→</span>
              <div>
                <strong className="text-white/80">Privacy & Data</strong>
                <p className="text-xs mt-0.5">Questions about your data? Reach our privacy team at privacy@blinderfit.com.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold text-xs mt-0.5">→</span>
              <div>
                <strong className="text-white/80">Partnerships & Business</strong>
                <p className="text-xs mt-0.5">Interested in partnerships, integrations, or corporate wellness? Email partnerships@blinderfit.com.</p>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Social</h2>
          <p>Follow us for updates on our launch and health insights.</p>
          <div className="flex gap-4 mt-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-xs transition-colors">X (Twitter)</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-xs transition-colors">Instagram</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-gold text-xs transition-colors">LinkedIn</a>
          </div>
        </section>
      </div>
    </div>
  </div>
);

export default Contact;
