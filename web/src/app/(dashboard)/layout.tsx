import * as React from 'react';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-foreground font-medium">Settings</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 space-y-6 p-8 pt-6 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}
