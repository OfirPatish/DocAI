"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useAdmin } from "@/hooks/use-admin";
import { useUpload } from "@/providers/upload-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, Shield, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
] as const;

interface SidebarContentProps {
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
}

export const SidebarContent = ({
  onNavigate,
  onClose,
  className,
}: SidebarContentProps) => {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isBusy } = useUpload();
  const isAdminPage = pathname.startsWith("/dashboard/admin");

  if (isLoading) {
    return (
      <aside
        className={cn(
          "flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
          className
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-sidebar-accent/30" aria-hidden />
          <div className="size-8 animate-pulse rounded-full bg-sidebar-accent/30" aria-hidden />
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 py-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-lg bg-sidebar-accent/30"
              aria-hidden
            />
          ))}
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="h-9 w-full animate-pulse rounded-lg bg-sidebar-accent/30" aria-hidden />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        isBusy && "pointer-events-none select-none opacity-60",
        className
      )}
      aria-busy={isBusy}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Dashboard</h2>
        <div className="flex items-center gap-1">
          <ModeToggle />
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
      <nav
        className="flex flex-1 flex-col gap-1 px-3 py-4"
        aria-label="Dashboard navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          prefetch={false}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
          aria-current={pathname === "/settings" ? "page" : undefined}
        >
          <Settings className="size-5 shrink-0" aria-hidden />
          Settings
        </Link>
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            prefetch={false}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isAdminPage
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            aria-current={isAdminPage ? "page" : undefined}
          >
            <Shield className="size-5 shrink-0" aria-hidden />
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto w-full items-center rounded-lg px-3 py-2"
              aria-label="User menu"
            >
              <span
                className="min-w-0 flex-1 truncate text-left text-sm text-sidebar-foreground/90"
                title={user?.email ?? undefined}
              >
                {user?.email ?? "Signed in"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48">
            <DropdownMenuItem
              onClick={() => signOut()}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};
