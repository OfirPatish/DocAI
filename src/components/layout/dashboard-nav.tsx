"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useAdmin } from "@/hooks/use-admin";
import { useUpload } from "@/providers/upload-provider";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, FolderOpen, Shield, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
] as const;

const getInitials = (email: string | undefined): string => {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
};

export const DashboardNav = () => {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isBusy } = useUpload();

  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold"
            prefetch={false}
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <FileText className="size-3.5 text-white" aria-hidden />
            </div>
            <span className="text-primary font-semibold">DocAI</span>
          </Link>
          <div className="flex-1" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>
    );
  }

  const isAdminPage = pathname.startsWith("/dashboard/admin");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-opacity duration-200",
        isBusy && "pointer-events-none select-none opacity-60",
      )}
      aria-busy={isBusy}
    >
      <div className="mx-auto flex h-14 items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/documents"
          className="flex shrink-0 items-center gap-2 font-bold transition-opacity hover:opacity-80"
          aria-label="DocAI home"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            <FileText className="size-3.5 text-white" aria-hidden />
          </div>
          <span className="hidden text-primary font-semibold sm:inline">
            DocAI
          </span>
        </Link>

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-6 sm:block"
        />

        <nav className="flex items-center gap-0.5" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link href={href} prefetch={false}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 gap-2 font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      <span className="hidden sm:inline">{label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="sm:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative size-9 rounded-full p-0"
                aria-label="User menu"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user?.email ?? undefined)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 px-2 py-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(user?.email ?? undefined)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="gap-2 cursor-pointer">
                  <Settings className="size-4" aria-hidden />
                  Settings
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/admin"
                      className={cn(
                        "gap-2 cursor-pointer",
                        isAdminPage && "bg-accent",
                      )}
                    >
                      <Shield className="size-4" aria-hidden />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
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
      </div>
    </header>
  );
};
