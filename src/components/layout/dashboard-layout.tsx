"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./dashboard-sidebar";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarContent className="h-dvh" />
      </div>

      {/* Mobile header + sheet trigger */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-60 max-w-[15rem] gap-0 p-0"
            showCloseButton={false}
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
            <SidebarContent
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
              className="h-full border-0"
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content */}
      <main
        id="dashboard-main"
        className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
        role="main"
      >
        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
