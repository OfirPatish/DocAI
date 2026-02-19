import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/ui/fade-in";
import {
  Shield,
  Zap,
  Upload,
  Search,
  MessageSquare,
  ArrowRight,
  FileText,
  Sparkles,
  Lock,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI chat with citations",
    description:
      "Ask questions about your PDFs. Get precise answers with source citations — RAG-powered, grounded in your docs.",
    color: "text-chart-1",
    bg: "bg-chart-1/10",
    hoverBg: "group-hover:bg-chart-1/20",
    hoverBorder: "hover:border-chart-1/30",
  },
  {
    icon: Shield,
    title: "Your data stays yours",
    description:
      "Documents never leave your account. Stored securely, used only to answer your questions.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    hoverBg: "group-hover:bg-chart-2/20",
    hoverBorder: "hover:border-chart-2/30",
  },
  {
    icon: Zap,
    title: "7 summary types",
    description:
      "Smart, Chapter, Core Points, Key Insights, Meeting Minutes, Legal/Contract. One-click, auto-cached.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    hoverBg: "group-hover:bg-chart-4/20",
    hoverBorder: "hover:border-chart-4/30",
  },
] as const;

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your PDF",
    description:
      "Drag & drop or click. PDF only, up to 10 MB. Duplicate name+size replaces existing.",
  },
  {
    step: "02",
    icon: Search,
    title: "Auto-index & embed",
    description:
      "Parsed, chunked, embedded for instant retrieval. Ready in seconds.",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Chat or summarize",
    description:
      "Ask questions (with citations) or pick from 7 summary types. All grounded in your content.",
  },
] as const;

const trustPoints = [
  { icon: Lock, text: "End-to-end encryption" },
  { icon: Shield, text: "Row-level security" },
  { icon: BookOpen, text: "Open, auditable architecture" },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background">
      <main id="main-content" className="flex-1" role="main">
        {/* Hero */}
        <section className="relative overflow-hidden bg-muted/30">
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32 md:pb-36 md:pt-40 lg:px-8">
            <FadeIn className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary sm:px-4 sm:text-sm">
                <Sparkles className="size-3.5" aria-hidden />
                AI-powered document intelligence
              </div>
              <h1 className="break-words text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-primary">DocAI</span> for your{" "}
                <br className="hidden sm:block" />
                private documents
              </h1>
              <p className="mx-auto mt-6 max-w-2xl break-words text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg lg:text-xl">
                Upload once, query anytime. No pasting, no context limits, no
                sharing sensitive content. RAG-powered AI chat and summarization
                grounded in{" "}
                <span className="font-semibold text-foreground">your docs</span>
                .
              </p>
              <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full touch-manipulation gap-2 text-base shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/25 sm:w-auto sm:px-8"
                  >
                    Start for free
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full touch-manipulation text-base sm:w-auto sm:px-8"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:mt-12">
                {trustPoints.map((point) => (
                  <span
                    key={point.text}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
                  >
                    <point.icon
                      className="size-3.5 text-primary/70"
                      aria-hidden
                    />
                    {point.text}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Features */}
        <section
          className="relative border-t border-border/50"
          aria-label="Features"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
                Features
              </p>
              <h2 className="break-words text-xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Everything you need for your documents
              </h2>
              <p className="mt-3 break-words text-sm text-muted-foreground sm:mt-4 sm:text-lg">
                AI chat with citations, 7 summary types, PDF viewer. Private and
                secure.
              </p>
            </FadeIn>
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {features.map((feature, i) => (
                <FadeIn key={feature.title} delay={i * 0.1}>
                  <div
                    className={`group flex min-w-0 flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg ${feature.hoverBorder} sm:p-8`}
                  >
                    <div
                      className={`inline-flex size-12 items-center justify-center rounded-xl ${feature.bg} ${feature.hoverBg} transition-colors`}
                    >
                      <feature.icon
                        className={`size-6 ${feature.color}`}
                        aria-hidden
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          className="border-t border-border/50 bg-muted/30"
          aria-label="How it works"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
                How it works
              </p>
              <h2 className="break-words text-xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Three steps to smarter documents
              </h2>
              <p className="mt-3 break-words text-sm text-muted-foreground sm:mt-4 sm:text-lg">
                Upload a PDF, let us index it, then chat or summarize.
              </p>
            </FadeIn>
            <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
              {/* Connector line between steps (desktop only) */}
              <div
                className="pointer-events-none absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] hidden h-px border-t border-dashed border-primary/30 sm:block"
                aria-hidden
              />
              {steps.map((item, i) => (
                <FadeIn key={item.step} delay={i * 0.15}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                      <item.icon className="size-7 text-white" aria-hidden />
                      <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-background text-[10px] font-bold text-primary ring-2 ring-primary/20">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50" aria-label="Get started">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 lg:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-8 text-center shadow-2xl shadow-primary/25 sm:rounded-3xl sm:p-12 md:p-16">
                <h2 className="break-words text-xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                  Ready to chat with your documents?
                </h2>
                <p className="mt-3 break-words text-sm text-white/80 sm:mt-4 sm:text-lg">
                  Sign up free — upload a PDF and start chatting or summarizing
                  in under a minute.
                </p>
                <Link href="/sign-up" className="mt-8 inline-block sm:mt-10">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 touch-manipulation gap-2 bg-white px-6 text-primary shadow-lg transition-shadow hover:bg-white/90 hover:shadow-xl sm:px-8"
                  >
                    Get started free
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary">
                  <FileText className="size-3 text-white" aria-hidden />
                </div>
                <span className="text-sm font-semibold text-primary">DocAI</span>
              </Link>
              <nav className="flex items-center gap-4" aria-label="Legal">
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy
                </Link>
              </nav>
            </div>
            <Separator className="sm:hidden" />
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} DocAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
