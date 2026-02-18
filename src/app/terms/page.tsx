import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for DocAI — AI document chat and summarization.",
  robots: { index: true, follow: true },
};

const lastUpdated = "February 18, 2025";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:text-muted-foreground [&_ul]:text-muted-foreground">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using DocAI (“Service”), you agree to be bound by
              these Terms of Service (“Terms”). If you do not agree, do not use
              the Service. These Terms apply to users worldwide, including users
              in the State of Israel.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              DocAI is an AI-powered document assistant that enables you to
              upload documents, obtain summaries, and ask questions about your
              content. The Service processes your documents using artificial
              intelligence to provide answers and summaries.
            </p>
          </section>

          <section>
            <h2>3. Account and Registration</h2>
            <p>
              You must create an account to use the Service. You are responsible
              for maintaining the confidentiality of your credentials and for all
              activity under your account. You must provide accurate registration
              information and notify us promptly of any unauthorized access.
            </p>
          </section>

          <section>
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Use the Service for any illegal purpose or in violation of
                applicable laws, including but not limited to Israeli law and the
                laws of your jurisdiction
              </li>
              <li>Upload content you do not have the right to use</li>
              <li>Upload malware, harmful code, or content that infringes third-party rights</li>
              <li>Attempt to gain unauthorized access to the Service or other accounts</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Resell or sublicense the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <p>
              You retain ownership of your documents and content. By using the
              Service, you grant us a limited license to process your content
              solely to provide the Service. DocAI, its branding, and the
              underlying technology remain our property or our licensors.
            </p>
          </section>

          <section>
            <h2>6. AI and Accuracy</h2>
            <p>
              The Service uses AI models that may produce inaccurate,
              incomplete, or outdated information. You are responsible for
              verifying important information. We do not guarantee the accuracy
              of summaries or answers.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, DocAI and its operators
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or for any loss of data,
              profits, or business opportunities. In no event shall our total
              liability exceed the amount you paid us in the twelve months
              preceding the claim (or the equivalent in local currency), or
              one hundred US dollars (USD 100) if you have not paid us.
            </p>
          </section>

          <section>
            <h2>8. Termination</h2>
            <p>
              We may suspend or terminate your access at any time for violation
              of these Terms or for other reasons. Upon termination, your right
              to use the Service ceases, and we may delete your data in
              accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2>9. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the State of Israel. For
              users in the European Union or other jurisdictions with mandatory
              consumer protection laws, the provisions of your local law may
              apply to the extent they cannot be waived. Disputes shall first be
              resolved through good-faith negotiation. Any disputes arising from
              or relating to these Terms may be brought before the courts of
              Israel, unless your jurisdiction requires otherwise.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms from time to time. We will notify you of
              material changes by posting the updated Terms on this page and
              updating the “Last updated” date. Continued use of the Service
              after changes constitutes acceptance. If you do not agree, you must
              stop using the Service and delete your account.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For questions about these Terms, contact us at the email address
              provided in the Privacy Policy or through the contact information
              on the DocAI website.
            </p>
          </section>
        </div>

        <footer className="mt-14 flex flex-wrap gap-4 border-t border-border pt-8">
          <Link
            href="/privacy"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Privacy Policy
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
