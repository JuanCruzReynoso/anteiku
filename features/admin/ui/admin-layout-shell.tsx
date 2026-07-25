"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AdminLayoutShellProps {
  userInitial: string;
  userName: string;
  userRole: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function AdminLayoutShell({
  children,
  sidebar,
}: AdminLayoutShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <SidebarInset className="min-h-screen">
        <header className="flex h-12 items-center border-b border-border/50 px-4">
          <SidebarTrigger />
        </header>
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
