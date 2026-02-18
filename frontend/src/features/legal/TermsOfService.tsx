export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: February 18, 2026
      </p>

      <section className="space-y-6 text-foreground/90 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using DeenVerse, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Account Registration</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>You must be at least 13 years old to use DeenVerse</li>
            <li>You must provide accurate and complete registration information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>One person may not maintain more than one account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Content Guidelines</h2>
          <p>As an Islamic platform, DeenVerse maintains high content standards:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Content must be respectful and align with Islamic values</li>
            <li>No misinformation about Islamic teachings or scholars</li>
            <li>No harassment, hate speech, or personal attacks</li>
            <li>No spam, commercial solicitation, or misleading content</li>
            <li>No explicit, violent, or inappropriate content</li>
            <li>Properly attribute hadiths and Islamic sources</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. User Content</h2>
          <p>
            You retain ownership of content you post. By posting, you grant
            DeenVerse a non-exclusive, worldwide, royalty-free license to
            display, distribute, and promote your content within the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Prohibited Activities</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Attempting to access other users' accounts</li>
            <li>Using automated bots or scrapers without permission</li>
            <li>Circumventing rate limits or security measures</li>
            <li>Distributing malware or harmful code</li>
            <li>Impersonating scholars, organizations, or other users</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Moderation</h2>
          <p>
            We reserve the right to remove content and suspend or ban accounts
            that violate these terms. Moderation actions include warnings,
            temporary mutes, and permanent bans. Users may appeal moderation
            decisions by contacting support.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Live Streaming</h2>
          <p>
            Streamers must comply with all content guidelines during live
            broadcasts. Streams may be terminated immediately if guidelines are
            violated. Recorded streams are subject to the same content policies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
          <p>
            DeenVerse and its original content, features, and functionality are
            owned by DeenVerse. Hadith texts are part of the Islamic scholarly
            tradition and are shared for educational purposes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
          <p>
            DeenVerse is provided "as is" without warranties of any kind. We are
            not liable for any indirect, incidental, or consequential damages
            arising from your use of the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of DeenVerse
            after changes constitutes acceptance of the new terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">11. Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
            <a href="mailto:legal@deenverse.com" className="text-primary hover:underline">
              legal@deenverse.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
