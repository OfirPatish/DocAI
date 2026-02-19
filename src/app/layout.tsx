import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : typeof process.env.VERCEL_URL === "string"
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined;

export const metadata: Metadata = {
  metadataBase,
  applicationName: "DocAI",
  appleWebApp: { capable: true, title: "DocAI", statusBarStyle: "default" },
  manifest: "/manifest.json",
  title: {
    default: "DocAI — AI Chat & Summarization",
    template: "%s | DocAI",
  },
  description:
    "Upload your documents, ask questions, get AI summaries. RAG-powered answers grounded in your docs.",
  keywords: ["document AI", "PDF", "RAG", "AI chat", "summarization", "chat"],
  authors: [{ name: "DocAI" }],
  creator: "DocAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DocAI",
    title: "DocAI — AI Chat & Summarization",
    description: "Upload PDFs, ask questions, get AI summaries. Answers grounded in your documents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocAI — AI Chat & Summarization",
    description: "Upload PDFs, ask questions, get AI summaries. Answers grounded in your documents.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <TooltipProvider delayDuration={300}>
              {children}
              <Toaster richColors position="top-center" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
