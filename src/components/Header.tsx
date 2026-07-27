"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";
import MainNavigation from "./MainNavigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-screen-xl">

  {/* Top Header */}
  <div className="flex h-20 items-center gap-4 px-4">

    {/* Mobile Menu */}
    {onMenuToggle && (
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center size-8 rounded-md hover:bg-accent"
      >
        <Menu className="size-5" />
      </button>
    )}

    {/* Logo */}
    <Link href="/" className="flex items-center gap-2">
      <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
        C
      </div>

      <span className="hidden sm:block font-semibold">
        CLW-DOCS
      </span>
    </Link>

    {/* Desktop Navigation */}
    <div className="hidden lg:block border-t">
      <div className="h-20 flex items-center px-4">
        <MainNavigation />
      </div>
    </div>

    {/* Search */}
    <button
      onClick={openSearch}
      className={cn(
        "mx-auto flex flex-1 max-w-md items-center gap-2 rounded-lg border px-3 py-2",
        "bg-muted/50 hover:bg-muted"
      )}
    >
      <Search className="size-4" />
      <span className="flex-1 text-left">Search documents...</span>

      <kbd className="hidden md:flex text-xs border rounded px-1">
        ⌘ K
      </kbd>
    </button>

    {/* Theme */}
    <ThemeToggle />

  </div>


</div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
