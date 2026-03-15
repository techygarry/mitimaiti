export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-charcoal mb-8">Terms of Service</h1>
      <p className="text-text-light mb-4">Last updated: March 15, 2026</p>

      <div className="prose prose-charcoal space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">1. Acceptance of Terms</h2>
          <p className="text-charcoal leading-relaxed">
            By creating an account or using MitiMaiti, you agree to these Terms of Service and our
            Privacy Policy. If you do not agree, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">2. Eligibility</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>You must be at least 18 years old</li>
            <li>You must provide accurate and truthful information</li>
            <li>You may only maintain one account</li>
            <li>You must not be prohibited from using the service under applicable law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">3. The MitiMaiti Service</h2>
          <p className="text-charcoal leading-relaxed">
            MitiMaiti is a free dating platform for the Sindhi community. All features are available
            to all users at no cost. There are no premium tiers, subscriptions, or in-app purchases.
          </p>
          <h3 className="font-medium text-charcoal mt-4 mb-2">3.1 Respect-First Messaging</h3>
          <p className="text-charcoal leading-relaxed">
            Our core feature: when a match is made, either person can send the first message. Once sent,
            the sender cannot send again until the other person replies. If no reply within 24 hours,
            the match dissolves. This is non-negotiable and cannot be bypassed.
          </p>
          <h3 className="font-medium text-charcoal mt-4 mb-2">3.2 Family Mode</h3>
          <p className="text-charcoal leading-relaxed">
            You may invite up to 3 family members who can browse and suggest profiles. Family members
            cannot see your chats, matches, swipes, or likes. You control exactly what they can view
            through permission toggles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">4. User Conduct</h2>
          <p className="text-charcoal leading-relaxed">You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Misrepresent your identity, age, or information</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Upload inappropriate, explicit, or illegal content</li>
            <li>Use the platform for commercial solicitation or spam</li>
            <li>Attempt to circumvent safety or moderation systems</li>
            <li>Create multiple accounts or use the account of another person</li>
            <li>Share phone numbers, social media handles, or URLs in the first 5 messages</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">5. Content Moderation</h2>
          <p className="text-charcoal leading-relaxed">
            We use a 3-layer moderation system: AI pre-screening, user reports, and admin enforcement.
            Content that violates our Community Guidelines may be removed. Violations result in strikes:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Strike 1: Warning</li>
            <li>Strike 2: 7-day suspension</li>
            <li>Strike 3: Permanent ban</li>
          </ul>
          <p className="text-charcoal leading-relaxed mt-2">
            Serious violations (underage users, CSAM, violence, bots) result in immediate permanent ban.
            You may appeal each strike once.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">6. Daily Limits</h2>
          <p className="text-charcoal leading-relaxed">
            To promote thoughtful engagement: 50 likes per day, 10 rewinds per day. These limits
            apply equally to all users. Counters reset at midnight.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">7. Account Termination</h2>
          <p className="text-charcoal leading-relaxed">
            You may delete your account at any time. A 30-day grace period allows you to recover
            your account by logging back in. After 30 days, your data is permanently deleted.
            We may terminate accounts that violate these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">8. Disclaimer</h2>
          <p className="text-charcoal leading-relaxed">
            MitiMaiti is provided &quot;as is&quot; without warranties. We do not guarantee matches,
            compatibility scores, or outcomes. Cultural and Kundli scores are for reference only
            and should not be the sole basis for relationship decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">9. Contact</h2>
          <p className="text-charcoal leading-relaxed">
            For questions about these terms, contact us at legal@mitimaiti.com.
          </p>
        </section>
      </div>
    </main>
  );
}
