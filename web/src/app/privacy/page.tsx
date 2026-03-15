export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-charcoal mb-8">Privacy Policy</h1>
      <p className="text-text-light mb-4">Last updated: March 15, 2026</p>

      <div className="prose prose-charcoal space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">1. Introduction</h2>
          <p className="text-charcoal leading-relaxed">
            MitiMaiti (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a dating platform built for the global Sindhi community.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
            our mobile application and website (collectively, the &quot;Platform&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">2. Information We Collect</h2>
          <h3 className="font-medium text-charcoal mt-4 mb-2">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Phone number (for authentication via OTP)</li>
            <li>Profile information: name, date of birth, gender, city, photos, bio</li>
            <li>Cultural information: Sindhi fluency, religion, gotra, generation, dietary preferences</li>
            <li>Chatti/Kundli data: nakshatra, rashi (optional, for compatibility scoring)</li>
            <li>Interests, prompts, voice introductions</li>
            <li>Messages and communications within the Platform</li>
            <li>Reports and feedback you submit</li>
          </ul>

          <h3 className="font-medium text-charcoal mt-4 mb-2">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Device information (type, OS, app version)</li>
            <li>Usage data (features used, time spent, interactions)</li>
            <li>IP address and approximate location (city-level)</li>
            <li>Push notification tokens</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>To provide and maintain the Platform</li>
            <li>To authenticate your identity via phone OTP</li>
            <li>To match you with compatible profiles using cultural and kundli scoring</li>
            <li>To enable the Family Mode feature (with your explicit permissions)</li>
            <li>To moderate content and ensure community safety</li>
            <li>To send notifications about matches, messages, and account activity</li>
            <li>To verify your identity through selfie verification</li>
            <li>To improve our services and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">4. Data Sharing</h2>
          <p className="text-charcoal leading-relaxed">
            We do not sell your personal data. We share data only with:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Other users (your public profile as controlled by your settings)</li>
            <li>Family members (only data you explicitly permit via Family Mode toggles)</li>
            <li>Service providers: Supabase (database), Sightengine (content moderation), AWS Rekognition (verification), Firebase (notifications), Twilio (OTP)</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">5. Data Retention</h2>
          <p className="text-charcoal leading-relaxed">
            We retain your data while your account is active. When you request deletion, we schedule
            it for 30 days (during which you can recover your account). After 30 days, your data is
            permanently deleted. Selfie verification images are deleted within 1 hour of processing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">6. Your Rights (GDPR / DPDP)</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li><strong>Access:</strong> Export all your data via Settings &gt; Account &gt; Export Data</li>
            <li><strong>Rectification:</strong> Edit your profile at any time</li>
            <li><strong>Deletion:</strong> Delete your account via Settings &gt; Account &gt; Delete Account</li>
            <li><strong>Portability:</strong> Download your data in JSON format</li>
            <li><strong>Restrict processing:</strong> Use Snooze Mode or toggle discovery off</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">7. Security</h2>
          <p className="text-charcoal leading-relaxed">
            We use industry-standard security measures including encrypted connections (TLS),
            secure authentication (Supabase Auth with JWT), rate limiting, and AI-powered content
            moderation. Photos are processed server-side with EXIF data stripped.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">8. Children&apos;s Privacy</h2>
          <p className="text-charcoal leading-relaxed">
            MitiMaiti is strictly for users aged 18 and above. We enforce this at both
            client and server level. If we discover an underage user, their account is
            immediately terminated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">9. Contact Us</h2>
          <p className="text-charcoal leading-relaxed">
            For privacy-related inquiries, contact us at privacy@mitimaiti.com.
          </p>
        </section>
      </div>
    </main>
  );
}
