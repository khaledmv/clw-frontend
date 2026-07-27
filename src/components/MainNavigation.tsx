"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { navigation } from "@/data/navigation";


function chunkArray<T>(array: T[], columns: number): T[][] {
  const chunkSize = Math.ceil(array.length / columns);

  return Array.from({ length: columns }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize)
  );
}


export default function MainNavigation() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-6">
  {navigation.map((menu, index) => {
    const columns = chunkArray(menu.items, menu.columns);

    const widthClass =
      menu.columns === 1
        ? "w-64"
        : menu.columns === 2
        ? "w-[520px]"
        : "w-[760px]";

    return (
      <div
        key={menu.title}
        className="relative"
        onMouseEnter={() => setOpen(index)}
        onMouseLeave={() => setOpen(null)}
      >
        {/* Menu Button */}
        <button className="flex items-center gap-1 text-sm font-medium hover:text-primary">
          {menu.title}
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Dropdown */}
        {open === index && (
          <div
            className={`absolute left-0 top-full pt-2 z-50 ${widthClass}`}
          >
            <div
              className={`grid gap-8 rounded-lg border bg-background p-6 shadow-xl ${
                menu.columns === 1
                  ? "grid-cols-1"
                  : menu.columns === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-1">
                  {column.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })}

  {/* Static menu */}
  <Link
    href="/order-parts"
    className="text-sm font-medium hover:text-primary"
  >
    Order Parts
  </Link>
</nav>
  );
}