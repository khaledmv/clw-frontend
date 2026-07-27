"use client";

import Link from "next/link";
import { navigation } from "@/data/navigation";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileNavigation({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto bg-background shadow-xl">

        <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">
            CLW-DOCS
        </h2>

        <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
        >
            <X className="h-5 w-5" />
        </button>
        </div>

        <div className="p-4 space-y-6">
            {navigation.map((section) => (
            <div key={section.title} className="border-b">

                <button
                onClick={() =>
                    setOpenSection(
                    openSection === section.title ? null : section.title
                    )
                }
                className="flex w-full items-center justify-between py-3 font-medium"
                >
                {section.title}

                <span>
                    {openSection === section.title ? "-" : "+"}
                </span>
                </button>

                {openSection === section.title && (
                <div className="pb-3 pl-4">
                    {section.items.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href}
                        onClick={onClose}
                        className="block py-2 text-sm hover:bg-muted px-2 rounded-md"
                    >
                        {item.title}
                    </Link>
                    ))}
                </div>
                )}

            </div>
            ))}
        </div>

      </aside>
    </>
  );
}