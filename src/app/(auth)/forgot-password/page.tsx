import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth";
import Link from "next/link";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
      <Link
        href="/"
        className="text-xl font-semibold text-primary transition-colors hover:text-primary/90 sm:text-2xl"
        aria-label="DocAI home"
      >
        DocAI
      </Link>
      <ForgotPasswordForm />
    </div>
  );
}
