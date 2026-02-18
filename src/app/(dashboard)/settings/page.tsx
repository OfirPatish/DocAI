"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, KeyRound, Loader2, Mail, LogOut } from "lucide-react";

const getInitials = (email: string | undefined): string => {
  if (!email) return "?";
  return email.charAt(0).toUpperCase();
};

export default function SettingsPage() {
  const { user, isLoading, signOut } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      toast.success("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Failed to update password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </header>

      <section className="space-y-6">
        <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-4 sm:gap-5">
            {isLoading ? (
              <>
                <Skeleton className="size-14 shrink-0 rounded-full sm:size-16" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 sm:w-56" />
                  <Skeleton className="h-3 w-36 sm:w-44" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="size-14 shrink-0 sm:size-16">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary sm:text-xl">
                    {getInitials(user?.email ?? undefined)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {user?.email}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{user?.email}</span>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <KeyRound className="size-4 text-primary" aria-hidden />
              </div>
              Change password
            </CardTitle>
            <CardDescription>Update your password. Must be at least 6 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div
                  className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {passwordError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isChangingPassword}
                  className="h-10"
                  aria-label="New password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isChangingPassword}
                  className="h-10"
                  aria-label="Confirm new password"
                />
              </div>
              <Button
                type="submit"
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="h-10 gap-2"
              >
                {isChangingPassword && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                {isChangingPassword ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <User className="size-4 text-primary" aria-hidden />
              </div>
              Account
            </CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Sign out</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  End your current session
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut()}
                className="h-9 shrink-0 gap-2 sm:w-auto"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-muted-foreground">
          Your documents are stored securely and accessible only by you.
        </p>
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
