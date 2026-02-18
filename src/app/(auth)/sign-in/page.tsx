import type { Metadata } from "next";
import { SignInForm } from "@/features/auth";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <Link
        href="/"
        className="text-xl font-semibold text-primary transition-colors hover:text-primary/90 sm:text-2xl"
        aria-label="DocAI home"
      >
        DocAI
      </Link>
      <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-lg bg-muted" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
