import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Brand panel - page-specific content, hidden on mobile */}
      <AuthBrandPanel />

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden">
            Home
          </Link>
          <ModeToggle />
        </div>

        <div className="w-full max-w-md">{children}</div>
        <footer className="mt-auto flex justify-center gap-4 pb-6 pt-8">
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
        </footer>
      </div>
    </div>
  );
}
