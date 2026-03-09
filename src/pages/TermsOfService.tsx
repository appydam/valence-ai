import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Terms of Service | Valence AI"
        description="Valence AI terms of service. Review the terms and conditions for using the Valence AI autonomous AI workforce platform."
        canonical="/terms"
        noIndex={true}
      />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/landing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 2, 2026
        </p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Valence AI ("the Service"), you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Description of Service
            </h2>
            <p>
              Valence AI is an autonomous AI workforce platform that provides AI
              agents to perform tasks, manage workflows, and integrate with
              third-party services on your behalf. The Service is provided "as
              is" and may be updated or modified at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. User Accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You are responsible for all activities that occur under your
                account.
              </li>
              <li>
                You must provide accurate and complete information when creating
                an account.
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to any part of the Service
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service
              </li>
              <li>
                Use the Service to send spam or unsolicited communications
              </li>
              <li>
                Reverse engineer, decompile, or disassemble any aspect of the
                Service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Third-Party Integrations
            </h2>
            <p>
              The Service allows you to connect third-party accounts (e.g.,
              Google, GitHub, Slack). By connecting these services, you
              authorize Valence AI to access and interact with these services
              on your behalf within the scope of permissions you grant. You are
              responsible for complying with the terms of service of any
              third-party services you connect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. AI Agent Actions
            </h2>
            <p>
              AI agents operate based on your instructions and configurations.
              While we strive for accuracy and reliability, AI agents may
              occasionally produce unexpected results. You are responsible for
              reviewing and verifying the outputs and actions of AI agents
              before relying on them for critical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Intellectual Property
            </h2>
            <p>
              You retain all rights to data you input into the Service.
              Content generated by AI agents on your behalf is owned by you.
              The Service itself, including its design, features, and
              underlying technology, is owned by Valence AI and protected by
              applicable intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Valence AI shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use of
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Termination
            </h2>
            <p>
              We may terminate or suspend your access to the Service at any
              time, with or without cause, with or without notice. Upon
              termination, your right to use the Service will immediately
              cease.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will
              provide notice of significant changes by updating the "Last
              updated" date. Your continued use of the Service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have questions about these Terms of Service, please
              contact us at{" "}
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
