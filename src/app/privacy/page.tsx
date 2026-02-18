import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for DocAI — How we collect, use, and protect your data.",
  robots: { index: true, follow: true },
};

const lastUpdated = "February 18, 2025";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to home"
          >
            <FileText className="size-4" aria-hidden />
            DocAI
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This policy applies to DocAI users worldwide, including users in the State of Israel 
            and the European Economic Area (EEA).
          </p>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:text-muted-foreground [&_ul]:text-muted-foreground">
          <section>
            <h2>1. Data Controller</h2>
            <p>
              DocAI (“we,” “us,” “our”) operates the DocAI service. We are the
              data controller for personal data collected through the Service.
              Our contact information is available on the DocAI website for
              privacy-related inquiries.
            </p>
          </section>

          <section>
            <h2>2. Data We Collect</h2>
            <p>We collect and process the following data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Account data:</strong> Email address, password (hashed)
              </li>
              <li>
                <strong>Documents:</strong> PDF files you upload and their
                extracted text for processing
              </li>
              <li>
                <strong>Usage data:</strong> Chat history, summaries, and
                interactions with the AI features
              </li>
              <li>
                <strong>Technical data:</strong> IP address, browser type,
                device information, and log data for security and operation
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Purposes of Processing</h2>
            <p>We process your data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide the DocAI service (summaries, chat, document storage)</li>
              <li>Authenticate and manage your account</li>
              <li>Improve and maintain the Service</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud, abuse, and security threats</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing</h2>
            <p>
              Under the EU General Data Protection Regulation (GDPR) and
              Israel&apos;s Privacy Protection Law:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Contract performance:</strong> Processing necessary to
                provide the Service you requested
              </li>
              <li>
                <strong>Legitimate interests:</strong> Security, fraud prevention,
                and service improvement
              </li>
              <li>
                <strong>Consent:</strong> Where we expressly ask for your
                consent for specific processing
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Data Recipients and Transfers</h2>
            <p>
              Your data is processed by our service providers (e.g., hosting,
              AI infrastructure) that act as processors under our instructions.
              Some providers may be located outside the EEA or Israel. Where we
              transfer data internationally, we ensure appropriate safeguards
              (e.g., adequacy decisions, standard contractual clauses, or
              equivalent mechanisms) as required by GDPR and Israeli law.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active.
              Documents, summaries, and chat history are stored until you
              delete them or request account deletion from us. After account
              deletion, we
              remove your data within a reasonable period, except where we must
              retain it for legal, regulatory, or legitimate operational
              purposes.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Rectification:</strong> Correct inaccurate or incomplete data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your data by
                contacting us
              </li>
              <li>
                <strong>Restriction:</strong> Request limitation of processing in
                certain circumstances
              </li>
              <li>
                <strong>Data portability:</strong> Receive your data in a
                structured, machine-readable format
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on legitimate
                interests
              </li>
              <li>
                <strong>Withdraw consent:</strong> Withdraw consent at any time
                where consent is the legal basis
              </li>
            </ul>
            <p>
              To exercise your rights, contact us at the email provided on the
              DocAI website. If you are in the EEA, you have the right to lodge
              a complaint with your local data protection authority. In Israel,
              you may contact the Privacy Protection Authority.
            </p>
          </section>

          <section>
            <h2>8. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your data, including encryption in transit, access
              controls, and secure storage. No method of transmission over the
              internet is completely secure; we strive to protect your data in
              line with industry standards.
            </p>
          </section>

          <section>
            <h2>9. Cookies and Similar Technologies</h2>
            <p>
              We use essential cookies and similar technologies necessary for
              authentication, security, and basic Service operation. We do not
              use advertising cookies or track you for third-party marketing.
            </p>
          </section>

          <section>
            <h2>10. Children</h2>
            <p>
              The Service is not intended for users under 16. We do not
              knowingly collect data from children. If you believe we have
              collected a child&apos;s data, please contact us to request deletion.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page and updating the “Last updated” date. Continued use of
              the Service after changes constitutes acceptance. For significant
              changes, we may provide additional notice.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              For privacy inquiries, to exercise your rights, or to contact our
              data protection representative, use the contact information
              provided on the DocAI website.
            </p>
          </section>
        </div>

        <footer className="mt-14 flex flex-wrap gap-4 border-t border-border pt-8">
          <Link
            href="/terms"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Home
          </Link>
        </footer>
      </article>
    </div>
  );
}
