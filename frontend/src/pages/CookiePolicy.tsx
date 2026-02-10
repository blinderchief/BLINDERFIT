import { Link } from 'react-router-dom';

const CookiePolicy = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Cookie Policy</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">Last updated: February 2026</p>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help the site function properly and provide a better user experience.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">How We Use Cookies</h2>
          <div className="space-y-4 mt-3">
            <div className="bg-[#111] border border-white/[0.06] rounded-lg p-4">
              <h3 className="text-white text-sm mb-1">Essential Cookies</h3>
              <p className="text-xs">Required for authentication, session management, and security. These cannot be disabled as they are necessary for the platform to function.</p>
            </div>
            <div className="bg-[#111] border border-white/[0.06] rounded-lg p-4">
              <h3 className="text-white text-sm mb-1">Functional Cookies</h3>
              <p className="text-xs">Remember your preferences like theme settings, language, and dashboard layout choices.</p>
            </div>
            <div className="bg-[#111] border border-white/[0.06] rounded-lg p-4">
              <h3 className="text-white text-sm mb-1">Analytics Cookies</h3>
              <p className="text-xs">Help us understand how you use the platform so we can improve features. This data is aggregated and does not identify you personally.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Third-Party Cookies</h2>
          <p>We use cookies from:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white/80">Clerk</strong> — for authentication session management</li>
            <li><strong className="text-white/80">Vercel Analytics</strong> — for anonymous usage analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling essential cookies may prevent the platform from functioning correctly. Most browsers allow you to:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>View all stored cookies</li>
            <li>Delete individual or all cookies</li>
            <li>Block cookies from specific sites</li>
            <li>Set preferences for first-party vs third-party cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Contact</h2>
          <p>For questions about our cookie practices, visit <Link to="/contact" className="text-gold hover:underline">our contact page</Link>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default CookiePolicy;
