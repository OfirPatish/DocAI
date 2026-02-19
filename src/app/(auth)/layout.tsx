import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthFormSlot } from "@/features/auth/components/auth-form-slot";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel — left side on desktop, hidden on mobile */}
      <AuthBrandPanel />

      {/* Form panel — right side on desktop, full width on mobile */}
      <div className="relative flex min-h-screen flex-1 flex-col px-4 py-8 sm:px-6 lg:min-h-0 lg:px-12">
        <div className="flex flex-1 flex-col items-center justify-center">
          <AuthFormSlot className="w-full max-w-md">{children}</AuthFormSlot>
        </div>
      </div>
    </div>
  );
}
