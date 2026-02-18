import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <Link
        href="/"
        className="text-xl font-semibold text-primary transition-colors hover:text-primary/90 sm:text-2xl"
        aria-label="DocAI home"
      >
        DocAI
      </Link>
      <SignUpForm />
    </div>
  );
}
