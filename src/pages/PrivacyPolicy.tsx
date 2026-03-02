import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/landing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 2, 2026
        </p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Introduction
            </h2>
            <p>
              Valence AI ("we", "our", or "us") operates the Valence platform
              (valence-beta.vercel.app). This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We may collect information about you in a variety of ways:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account Information:</strong>{" "}
                When you sign up, we collect your name, email address, and
                profile information provided through your authentication
                provider (e.g., Google).
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> We
                automatically collect information about how you interact with
                the platform, including pages visited, features used, and
                timestamps.
              </li>
              <li>
                <strong className="text-foreground">Integration Data:</strong>{" "}
                When you connect third-party services (e.g., Google Sheets,
                GitHub), we store authentication tokens securely to maintain
                your connections. We access only the data necessary to perform
                the actions you request.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide, operate, and maintain the platform</li>
              <li>To execute tasks and workflows on your behalf through AI agents</li>
              <li>To connect and interact with third-party services you authorize</li>
              <li>To improve and personalize your experience</li>
              <li>To communicate with you about updates and support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              data. Integration tokens are encrypted using AES-256-GCM
              encryption. However, no method of transmission over the Internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Third-Party Services
            </h2>
            <p>
              Our platform integrates with third-party services (e.g., Google,
              GitHub, Slack). When you connect these services, their respective
              privacy policies apply to the data they process. We only request
              the minimum permissions necessary for the features you use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active or as
              needed to provide you services. You may request deletion of your
              account and associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Disconnect any third-party integration at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by updating the "Last updated" date at
              the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:arpitdhamija.ai@gmail.com"
                className="text-primary hover:underline"
              >
                arpitdhamija.ai@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
