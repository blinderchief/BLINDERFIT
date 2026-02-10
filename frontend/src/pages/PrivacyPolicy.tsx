import { Link } from 'react-router-dom';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Privacy Policy</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">Last updated: February 2026</p>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">1. Information We Collect</h2>
          <p>BlinderFit collects information you provide directly, including your name, email address, health assessment data (such as BMI, dietary preferences, fitness goals, and medical history), daily tracking data (meals, workouts, sleep, water intake), and profile information.</p>
          <p className="mt-2">We also collect usage data such as pages visited, features used, device information, and session duration to improve our platform.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To provide AI-personalized fitness and nutrition plans via Google Gemini</li>
            <li>To power your PulseHub dashboard with real-time health insights</li>
            <li>To adapt recommendations based on your tracked progress</li>
            <li>To improve our platform and develop new features</li>
            <li>To communicate with you about your account and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We use Clerk for authentication and Neon PostgreSQL for data storage, both of which implement SOC 2 compliant security practices. Health data is encrypted at rest and in transit.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">4. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white/80">Google Gemini API</strong> — to generate personalized AI recommendations (anonymized where possible)</li>
            <li><strong className="text-white/80">Clerk</strong> — for secure authentication</li>
            <li><strong className="text-white/80">Analytics</strong> — aggregated, non-identifying usage metrics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data at any time. You can export your data or request account deletion by contacting us. We comply with applicable data protection regulations including GDPR principles.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">6. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon deletion, your data is permanently removed within 30 days, except where retention is required by law.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">7. Contact</h2>
          <p>For privacy-related inquiries, reach us at <Link to="/contact" className="text-gold hover:underline">our contact page</Link> or email privacy@blinderfit.com.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
