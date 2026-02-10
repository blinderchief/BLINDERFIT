const Accessibility = () => (
  <div className="min-h-screen bg-black py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-light text-white tracking-wider mb-2">Accessibility</h1>
      <p className="text-xs text-white/40 mb-10 tracking-wider">Our commitment to inclusive design</p>

      <div className="space-y-8 text-sm text-white/60 leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Our Commitment</h2>
          <p>BlinderFit is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Standards</h2>
          <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. This includes:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Sufficient color contrast ratios throughout the interface</li>
            <li>Keyboard navigation support for all interactive elements</li>
            <li>Semantic HTML structure for screen reader compatibility</li>
            <li>Alt text for meaningful images</li>
            <li>Responsive design that adapts to different screen sizes and zoom levels</li>
            <li>Focus indicators on interactive elements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Inclusive Fitness</h2>
          <p>Beyond digital accessibility, BlinderFit's AI is designed to create personalized fitness plans for users of all ability levels, including:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Low-impact workout alternatives for those with mobility limitations</li>
            <li>Adaptive exercise modifications based on individual needs</li>
            <li>Senior-friendly programs with appropriate intensity levels</li>
            <li>Dietary plans that account for medical conditions and restrictions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Known Limitations</h2>
          <p>As BlinderFit is in beta, we're actively working on improving accessibility. Some areas under improvement include:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            <li>Enhanced screen reader support for chart visualizations</li>
            <li>Improved keyboard navigation in complex dashboard components</li>
            <li>Additional ARIA labels for interactive widgets</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white text-lg font-light mb-3 tracking-wide">Feedback</h2>
          <p>If you encounter accessibility barriers on BlinderFit, please let us know. We take accessibility feedback seriously and will work to address issues promptly. Contact us at accessibility@blinderfit.com.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Accessibility;
