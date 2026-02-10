import { Link } from 'react-router-dom';

const Legal = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Terms of Service</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">Last updated: February 2026</p>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">1. Acceptance of Terms</h2>
          <p>By accessing or using BlinderFit ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. BlinderFit is currently in beta and features are subject to change.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">2. Description of Service</h2>
          <p>BlinderFit provides AI-powered fitness coaching, personalized nutrition plans, health tracking, and wellness features. Our AI recommendations are generated using Google Gemini and are intended for general wellness purposes only.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">3. Medical Disclaimer</h2>
          <p className="text-amber-400/80">BlinderFit is not a medical device and does not provide medical advice. AI-generated recommendations are for informational purposes only. Always consult a qualified healthcare provider before making changes to your diet, exercise, or healthcare routine, especially if you have pre-existing conditions.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">4. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Use the platform for any unlawful purpose</li>
            <li>Attempt to access other users' data or accounts</li>
            <li>Reverse engineer or exploit the AI system</li>
            <li>Submit false or misleading health information</li>
            <li>Use automated tools to scrape or collect data from the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">6. Intellectual Property</h2>
          <p>All content, AI models, branding, and code are owned by BlinderFit. You retain rights to your personal data. AI-generated content provided to you is licensed for personal use only.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">7. Beta Service</h2>
          <p>BlinderFit is currently in beta. We provide the service "as is" without warranties. Features may change, and we are not liable for service interruptions during the beta period.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">8. Limitation of Liability</h2>
          <p>BlinderFit and its team shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to health outcomes based on AI recommendations.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">9. Contact</h2>
          <p>Questions about these terms? Reach us at <Link to="/contact" className="text-gold hover:underline">our contact page</Link>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Legal;
