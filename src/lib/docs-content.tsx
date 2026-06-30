import type { DocPageMeta } from "@/types";

export interface DocPage extends DocPageMeta {
  content: React.ReactNode;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm font-mono leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="callout callout-info my-6">
      <span className="text-blue-500 shrink-0 mt-0.5">ℹ</span>
      <div>{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="callout callout-tip my-6">
      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
      <div>{children}</div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="callout callout-warning my-6">
      <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
      <div>{children}</div>
    </div>
  );
}

const pages: Record<string, DocPage> = {
  "": {
    title: "Introduction",
    description: "Welcome to CLW — a Next.js 15 frontend connected to your Laravel REST API.",
    headings: [
      { id: "overview", text: "Overview", level: 2 },
      { id: "features", text: "Features", level: 2 },
      { id: "tech-stack", text: "Tech Stack", level: 2 },
      { id: "quick-start", text: "Quick Start", level: 2 },
    ],
    prev: undefined,
    next: { title: "Installation", href: "/docs/installation" },
    content: (
      <>
        <h2 id="overview">Overview</h2>
        <p>
          CLW Frontend is a <strong>Next.js 15</strong> application built with
          the App Router, TypeScript, and Tailwind CSS. It communicates with a
          Laravel REST API running at{" "}
          <code>http://localhost:8000</code> and provides a docs-style interface
          for exploring and interacting with your backend.
        </p>

        <h2 id="features">Features</h2>
        <ul>
          <li>App Router with React Server Components</li>
          <li>Full-featured docs layout — sidebar, content, table of contents</li>
          <li>Dark / Light / System theme with <code>next-themes</code></li>
          <li>Keyboard-driven search (Cmd K / Ctrl K)</li>
          <li>Typed API client for your Laravel backend</li>
          <li>Token-based authentication (Bearer / Sanctum)</li>
          <li>Generic CRUD factory for any resource</li>
        </ul>

        <h2 id="tech-stack">Tech Stack</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Layer</th>
                <th>Technology</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Framework</td><td>Next.js 15 (App Router)</td></tr>
              <tr><td>Language</td><td>TypeScript 5</td></tr>
              <tr><td>Styling</td><td>Tailwind CSS 3</td></tr>
              <tr><td>Icons</td><td>Lucide React</td></tr>
              <tr><td>Theming</td><td>next-themes</td></tr>
              <tr><td>Backend</td><td>Laravel REST API (localhost:8000)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="quick-start">Quick Start</h2>
        <Code>{`# Install dependencies
npm install

# Start the dev server
npm run dev`}</Code>
        <p>
          Open <code>http://localhost:3000</code> — it redirects to{" "}
          <code>/docs</code> automatically.
        </p>
        <Note>
          Make sure your Laravel server is running on{" "}
          <code>http://localhost:8000</code> before making API requests.
        </Note>
      </>
    ),
  },

  installation: {
    title: "Installation",
    description: "How to install and run the CLW frontend.",
    headings: [
      { id: "prerequisites", text: "Prerequisites", level: 2 },
      { id: "install", text: "Install Dependencies", level: 2 },
      { id: "env", text: "Environment Variables", level: 2 },
      { id: "run", text: "Running the App", level: 2 },
    ],
    prev: { title: "Introduction", href: "/docs" },
    next: { title: "Project Structure", href: "/docs/project-structure" },
    content: (
      <>
        <h2 id="prerequisites">Prerequisites</h2>
        <ul>
          <li>Node.js 18.18+ or 20+</li>
          <li>npm, yarn, or pnpm</li>
          <li>Laravel API server running on port 8000</li>
        </ul>

        <h2 id="install">Install Dependencies</h2>
        <Code>{`cd clw-frontend
npm install`}</Code>

        <h2 id="env">Environment Variables</h2>
        <p>Copy the example env file and set your API URL:</p>
        <Code>{`# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000`}</Code>
        <Warning>
          Never commit <code>.env.local</code> to version control. It is already
          listed in <code>.gitignore</code>.
        </Warning>

        <h2 id="run">Running the App</h2>
        <Code>{`# Development
npm run dev

# Production build
npm run build
npm start`}</Code>
        <Tip>
          The dev server starts on <code>http://localhost:3000</code> by default.
          Use <code>next dev --port 3001</code> to change the port.
        </Tip>
      </>
    ),
  },

  "project-structure": {
    title: "Project Structure",
    description: "Overview of the directory layout.",
    headings: [
      { id: "top-level", text: "Top-Level Files", level: 2 },
      { id: "src", text: "src/ Directory", level: 2 },
      { id: "app", text: "app/ — Routes & Layouts", level: 3 },
      { id: "components", text: "components/ — UI", level: 3 },
      { id: "lib", text: "lib/ — Utilities & API", level: 3 },
    ],
    prev: { title: "Installation", href: "/docs/installation" },
    next: { title: "Configuration", href: "/docs/configuration" },
    content: (
      <>
        <h2 id="top-level">Top-Level Files</h2>
        <Code>{`clw-frontend/
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind + dark mode
├── tsconfig.json        # TypeScript config
├── postcss.config.mjs
├── .env.local           # API URL and secrets
└── package.json`}</Code>

        <h2 id="src">src/ Directory</h2>

        <h3 id="app">app/ — Routes & Layouts</h3>
        <Code>{`src/app/
├── layout.tsx           # Root layout (fonts, Providers)
├── page.tsx             # Redirects to /docs
├── globals.css          # Tailwind base + prose styles
└── docs/
    ├── layout.tsx       # Docs shell (header, sidebar)
    └── [[...slug]]/
        └── page.tsx     # Catch-all docs page`}</Code>

        <h3 id="components">components/ — UI</h3>
        <Code>{`src/components/
├── Providers.tsx        # ThemeProvider wrapper
├── Header.tsx           # Top nav bar + search
├── Sidebar.tsx          # Left navigation
├── TableOfContents.tsx  # Right TOC with scroll-spy
├── SearchDialog.tsx     # Cmd+K search modal
├── ThemeToggle.tsx      # Dark/light toggle
└── MobileNav.tsx        # Slide-in mobile drawer`}</Code>

        <h3 id="lib">lib/ — Utilities & API</h3>
        <Code>{`src/lib/
├── api.ts           # Typed Laravel API client
├── navigation.ts    # Sidebar nav structure
├── docs-content.tsx # Doc page content map
└── utils.ts         # cn() + helpers`}</Code>
      </>
    ),
  },

  configuration: {
    title: "Configuration",
    description: "Configure Next.js, Tailwind, and the API client.",
    headings: [
      { id: "nextjs", text: "Next.js Config", level: 2 },
      { id: "tailwind", text: "Tailwind Config", level: 2 },
      { id: "api-base-url", text: "API Base URL", level: 2 },
    ],
    prev: { title: "Project Structure", href: "/docs/project-structure" },
    next: { title: "Authentication Overview", href: "/docs/auth" },
    content: (
      <>
        <h2 id="nextjs">Next.js Config</h2>
        <p>
          <code>next.config.ts</code> rewrites <code>/api/*</code> to the
          Laravel backend, keeping your frontend and API on the same origin in
          development:
        </p>
        <Code>{`// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: \`\${process.env.NEXT_PUBLIC_API_URL}/api/:path*\`,
      },
    ];
  },
};`}</Code>

        <h2 id="tailwind">Tailwind Config</h2>
        <p>
          Dark mode is set to <code>&quot;class&quot;</code> so{" "}
          <code>next-themes</code> can toggle it by adding/removing the{" "}
          <code>dark</code> class on <code>&lt;html&gt;</code>:
        </p>
        <Code>{`// tailwind.config.ts
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  // ...
};`}</Code>

        <h2 id="api-base-url">API Base URL</h2>
        <Code>{`# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com`}</Code>
        <Note>
          The <code>NEXT_PUBLIC_</code> prefix exposes the variable to the
          browser bundle. Do not prefix secrets with it.
        </Note>
      </>
    ),
  },

  auth: {
    title: "Authentication Overview",
    description: "How authentication works between the frontend and Laravel.",
    headings: [
      { id: "strategy", text: "Strategy", level: 2 },
      { id: "token-storage", text: "Token Storage", level: 2 },
      { id: "api-helpers", text: "API Helpers", level: 2 },
    ],
    prev: { title: "Configuration", href: "/docs/configuration" },
    next: { title: "Login & Register", href: "/docs/auth/login" },
    content: (
      <>
        <h2 id="strategy">Strategy</h2>
        <p>
          The frontend uses <strong>Bearer token</strong> authentication. After
          login, the API returns an access token which is stored in{" "}
          <code>localStorage</code> and sent as an{" "}
          <code>Authorization: Bearer &lt;token&gt;</code> header on every
          subsequent request.
        </p>
        <Warning>
          <code>localStorage</code> is accessible to JavaScript. For
          high-security apps, consider using HTTP-only cookies via Laravel
          Sanctum&#39;s SPA mode.
        </Warning>

        <h2 id="token-storage">Token Storage</h2>
        <Code>{`import { setToken, clearToken } from "@/lib/api";

// After login
setToken(response.data.access_token);

// On logout
clearToken();`}</Code>

        <h2 id="api-helpers">API Helpers</h2>
        <Code>{`import { auth } from "@/lib/api";

// Login
const res = await auth.login({ email, password });
setToken(res.data.access_token);

// Get current user
const user = await auth.me();

// Logout
await auth.logout();
clearToken();`}</Code>
      </>
    ),
  },

  api: {
    title: "Making Requests",
    description: "How to use the typed API client to call your Laravel backend.",
    headings: [
      { id: "client", text: "The API Client", level: 2 },
      { id: "crud-factory", text: "CRUD Factory", level: 2 },
      { id: "error-handling", text: "Error Handling", level: 2 },
    ],
    prev: { title: "Token Management", href: "/docs/auth/tokens" },
    next: { title: "Endpoints", href: "/docs/api/endpoints" },
    content: (
      <>
        <h2 id="client">The API Client</h2>
        <p>
          <code>src/lib/api.ts</code> exports a typed{" "}
          <code>apiFetch</code> wrapper that automatically attaches the auth
          token and sets JSON headers:
        </p>
        <Code>{`// Usage in a Server Component
import { posts } from "@/lib/api";

export default async function PostsPage() {
  const { data } = await posts.list({ page: 1, per_page: 20 });
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}`}</Code>

        <h2 id="crud-factory">CRUD Factory</h2>
        <p>
          Use <code>createResource</code> to generate fully-typed CRUD methods
          for any Laravel resource in seconds:
        </p>
        <Code>{`import { createResource } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export const products = createResource<Product>("/products");

// Now you have:
products.list({ page: 1 })       // GET /api/products
products.get(42)                  // GET /api/products/42
products.create({ name, price })  // POST /api/products
products.update(42, { price })    // PATCH /api/products/42
products.destroy(42)              // DELETE /api/products/42`}</Code>

        <h2 id="error-handling">Error Handling</h2>
        <Code>{`import { ApiRequestError } from "@/lib/api";

try {
  await products.create({ name: "", price: -1 });
} catch (err) {
  if (err instanceof ApiRequestError) {
    console.log(err.status);   // 422
    console.log(err.message);  // "The name field is required."
    console.log(err.errors);   // { name: ["required"], price: ["min"] }
  }
}`}</Code>
      </>
    ),
  },
};

export function getDocPage(slug: string[]): DocPage | null {
  const key = slug.join("/");
  return pages[key] ?? null;
}

export function getAllDocSlugs(): string[][] {
  return Object.keys(pages).map((key) => (key === "" ? [] : key.split("/")));
}
