import React from 'react';

const CookiesInfo = () => (
  <div className="gofit-container py-12 min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-3xl md:text-4xl font-light tracking-wider text-gofit-gold mb-6">Why We Use Cookies</h1>
    <div className="max-w-2xl text-gofit-offwhite text-lg space-y-6 bg-gofit-charcoal p-8 rounded shadow-lg">
      <p>
        Cookies are small text files stored on your device to help us provide a better, more personalized experience on BlinderFit.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><b>Personalization:</b> Remember your preferences and settings for a tailored experience.</li>
        <li><b>Analytics:</b> Understand how you use our site so we can improve features and content.</li>
        <li><b>Security:</b> Help keep your account safe by detecting suspicious activity.</li>
        <li><b>Session Management:</b> Keep you logged in and maintain your progress across pages.</li>
      </ul>
      <p>
        We respect your privacy and use cookies responsibly. You can manage your cookie preferences in your browser settings at any time.
      </p>
      <p>
        For more details, see our <a href="/privacy" className="text-gofit-gold underline">Privacy Policy</a>.
      </p>
    </div>
  </div>
);

export default CookiesInfo;
