"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <nav className={cn("w-full", className)}>
      <div className="space-y-6 py-4">
        {navigation.map((section) => {
          const isCollapsed = collapsed[section.title];
          const hasActive = section.items.some((item) =>
            pathname === item.href || pathname.startsWith(item.href + "/")
          );

          return (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    !isCollapsed && "rotate-90"
                  )}
                />
              </button>

              {(!isCollapsed || hasActive) && (
                <ul className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/docs" &&
                        pathname.startsWith(item.href + "/"));

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavClick}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          {isActive && (
                            <span className="size-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <span className={cn(!isActive && "pl-3.5")}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-medium uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
