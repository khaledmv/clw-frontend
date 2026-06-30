import type { NavSection } from "@/types";

export const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Project Structure", href: "/docs/project-structure" },
      { title: "Configuration", href: "/docs/configuration" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { title: "Overview", href: "/docs/auth" },
      { title: "Login & Register", href: "/docs/auth/login" },
      { title: "Token Management", href: "/docs/auth/tokens" },
      { title: "Sanctum / Passport", href: "/docs/auth/sanctum" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Making Requests", href: "/docs/api" },
      { title: "Endpoints", href: "/docs/api/endpoints" },
      { title: "Pagination", href: "/docs/api/pagination" },
      { title: "Error Handling", href: "/docs/api/errors" },
      { title: "Filtering & Sorting", href: "/docs/api/filtering" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Fetching Data", href: "/docs/guides/fetching-data" },
      { title: "Forms & Mutations", href: "/docs/guides/forms" },
      { title: "File Uploads", href: "/docs/guides/uploads" },
      { title: "Real-time Events", href: "/docs/guides/realtime" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Environment Variables", href: "/docs/deployment/env" },
      { title: "Production Build", href: "/docs/deployment/build" },
      { title: "CORS Configuration", href: "/docs/deployment/cors" },
    ],
  },
];

export const allNavItems = navigation.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.title }))
);
