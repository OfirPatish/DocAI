import { AuthProvider } from "@/features/auth";
import { UploadProvider } from "@/providers/upload-provider";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UploadProvider>
        <div className="flex h-dvh flex-col overflow-hidden bg-muted/20">
        <a
          href="#dashboard-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <DashboardNav />
        <main
          id="dashboard-main"
          className="w-full flex-1 min-h-0 overflow-auto p-4 sm:p-6 lg:p-8"
          role="main"
        >
          {children}
        </main>
      </div>
      </UploadProvider>
    </AuthProvider>
  );
}
