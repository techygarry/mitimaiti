export default function GuidelinesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-charcoal mb-8">Community Guidelines</h1>
      <p className="text-text-light mb-4">Last updated: March 15, 2026</p>

      <div className="prose prose-charcoal space-y-6">
        <section>
          <p className="text-charcoal leading-relaxed text-lg">
            MitiMaiti is a space for Sindhi hearts to connect with respect, authenticity, and cultural pride.
            These guidelines help keep our community safe and welcoming for everyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Be Authentic</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Use your real name and recent photos</li>
            <li>Be honest about your age, location, and intentions</li>
            <li>Complete your profile — it helps others make informed decisions</li>
            <li>Verify your profile with a selfie for the trust badge</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Be Respectful</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Treat every person with dignity, regardless of religion, gender, or background</li>
            <li>Our Respect-First messaging exists for a reason — honour the 24-hour window</li>
            <li>No means no. If someone doesn&apos;t reply or passes, accept it gracefully</li>
            <li>Do not share explicit or sexual content</li>
            <li>Do not ask for money or promote services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Keep It Safe</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Don&apos;t share phone numbers, social media, or URLs in your first 5 messages</li>
            <li>Report any suspicious or harmful behaviour immediately</li>
            <li>Never meet someone for the first time alone — always in a public place</li>
            <li>Trust your instincts — if something feels off, block and report</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Zero Tolerance</h2>
          <p className="text-charcoal leading-relaxed">
            The following result in immediate, permanent removal from MitiMaiti:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Underage users (under 18)</li>
            <li>Child sexual abuse material (CSAM)</li>
            <li>Threats of violence</li>
            <li>Bots or fake accounts</li>
            <li>Hate speech targeting any community or religion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Photo Guidelines</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Upload clear photos of yourself (at least 1 required)</li>
            <li>No nudity or sexually explicit images</li>
            <li>No photos of minors</li>
            <li>No photos with weapons, drugs, or illegal activity</li>
            <li>No copyrighted images or photos of celebrities</li>
            <li>All photos are screened by AI before being published</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Family Mode Etiquette</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li>Family members should respect the user&apos;s autonomy and privacy</li>
            <li>Suggestions are recommendations, not mandates — the user always decides</li>
            <li>Decisions (like/pass) are never revealed to family members</li>
            <li>Family members cannot access chats, matches, or swipes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Strike System</h2>
          <ul className="list-disc pl-6 space-y-1 text-charcoal">
            <li><strong>Strike 1:</strong> Warning notification</li>
            <li><strong>Strike 2:</strong> 7-day account suspension</li>
            <li><strong>Strike 3:</strong> Permanent ban</li>
            <li>Strikes expire after 90 days if no further violations</li>
            <li>You may appeal each strike once (reviewed by a different admin within 48-72 hours)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-charcoal mt-8 mb-3">Report a Concern</h2>
          <p className="text-charcoal leading-relaxed">
            If you encounter behaviour that violates these guidelines, please report it using the
            report button on any profile or chat screen. Your report is confidential. We take every
            report seriously and review them based on priority.
          </p>
          <p className="text-charcoal leading-relaxed mt-2">
            For urgent safety concerns, contact us at safety@mitimaiti.com.
          </p>
        </section>
      </div>
    </main>
  );
}
