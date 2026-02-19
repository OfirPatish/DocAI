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
import { Loader2, Mail, LogOut } from "lucide-react";

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
    <div className="mx-auto flex w-full max-w-xl flex-col">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="size-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="size-12 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                    {getInitials(user?.email ?? undefined)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{user?.email}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{user?.email}</span>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Change password</CardTitle>
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
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <Label htmlFor="confirm-password">Confirm</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repeat password"
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Account</CardTitle>
            <CardDescription>Sign out of your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                End your current session.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut()}
                className="h-9 shrink-0 gap-2"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">About</CardTitle>
            <CardDescription>Appearance & data handling</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Theme toggle is in the sidebar. Documents are stored in your Supabase project with row-level security. AI uses OpenAI; no data for training.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 border-t border-border pt-6 sm:mt-10 sm:pt-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-muted-foreground">
            Your documents are stored securely and accessible only by you.
          </p>
          <nav className="flex gap-4" aria-label="Legal links">
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
