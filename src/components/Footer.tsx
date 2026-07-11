import Link from "next/link";

const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Solutions",
    links: ["Clean Water", "Water Quality", "Wastewater Treatment", "Service"],
  },
  {
    title: "Resources",
    links: [
      "API Documentation",
      "Profile and Preference",
      "Team Map and Locations",
      "Learning Tracks",
      "Upcoming Events",
    ],
  },
  {
    title: "Company",
    links: ["About", "News", "Careers", "Privacy Policy", "Cookies Policy", "Contact Us"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                C
              </div>
              <span className="font-semibold text-foreground">CLW-DOCS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Cleanwater1 is a leading provider of water quality solutions and the
              only to offer a complete set of end-to-end water quality and
              wastewater treatment products and solutions.
            </p>
          </div>

          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((label) => (
                  <li key={label}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} clw-docs-backend. All rights reserved.</p>
          <p>By Pixit Design</p>
        </div>
      </div>
    </footer>
  );
}
