"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Search, Github, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";
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
        <div className="flex h-14 items-center gap-4 px-4">
          {/* Mobile menu button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="size-5" />
            </button>
          )}

          {/* Logo */}
          <Link href="/docs" className="flex items-center gap-2 mr-4">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              C
            </div>
            <span className="font-semibold text-foreground hidden sm:block">
              CLW Docs
            </span>
          </Link>

          {/* Search */}
          <button
            onClick={openSearch}
            className={cn(
              "flex flex-1 max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2",
              "text-sm text-muted-foreground hover:bg-muted transition-colors cursor-text"
            )}
          >
            <Search className="size-4 shrink-0" />
            <span className="flex-1 text-left">Search docs...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 text-xs border border-border rounded px-1.5 py-0.5 bg-background">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
