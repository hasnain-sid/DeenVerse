export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">
        Last updated: February 18, 2026
      </p>

      <section className="space-y-6 text-foreground/90 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>
            We collect information you provide when you create an account (name,
            email, username), content you post (hadith shares, posts, messages),
            and usage data (pages visited, interactions, device info).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>To provide, maintain, and improve DeenVerse services</li>
            <li>To personalize your feed and recommendations</li>
            <li>To send notifications you've opted into</li>
            <li>To detect and prevent fraud, abuse, and security issues</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Service providers (AWS, MongoDB Atlas) for hosting and infrastructure</li>
            <li>Law enforcement when required by applicable law</li>
            <li>Other users — your profile, posts, and activity are visible as set by your privacy settings</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p>
            We use industry-standard encryption (HTTPS/TLS), secure password
            hashing (bcrypt), and access controls to protect your data. However,
            no method of transmission over the Internet is 100% secure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of non-essential communications</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>
            We use essential cookies for authentication (JWT tokens) and
            preferences (theme selection). We use analytics cookies only with
            your consent to understand how to improve the platform.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Children's Privacy</h2>
          <p>
            DeenVerse is not intended for children under 13. We do not knowingly
            collect information from children under 13.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:privacy@deenverse.com" className="text-primary hover:underline">
              privacy@deenverse.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
