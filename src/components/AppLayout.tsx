"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNavigation } from "./MobileNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onMenuToggle={() => setMobileOpen(true)} />

      <MobileNavigation
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1">{children}</div>

      <Footer />
    </div>
  );
}