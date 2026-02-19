"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";

/**
 * Client-side hook to check admin status.
 * Calls /api/admin/check once per auth session.
 */
export const useAdmin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      queueMicrotask(() => {
        setIsAdmin(false);
        setIsChecking(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsChecking(true);
    });

    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data: { isAdmin: boolean }) => {
        if (!cancelled) {
          setIsAdmin(data.isAdmin === true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, isChecking };
};
