"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setMobileNavOpen(true)} />

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] w-60 xl:w-64 shrink-0 overflow-y-auto border-r border-border bg-sidebar px-2">
          <Sidebar />
        </aside>

        {/* Page content — children includes main + optional TOC */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
