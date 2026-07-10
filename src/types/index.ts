export interface NavItem {
  title: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocPageMeta {
  title: string;
  description: string;
  headings: Heading[];
}

// ── API types ────────────────────────────────────────────────────────────────

export interface ApiMeta {
  total: number;
  per_page: number;
  last_page: number;
  current_page: number;
  page?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: ApiMeta;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Documents ────────────────────────────────────────────────────────────────

export interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
}

export interface Document {
  id: number;
  title: string;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
  description: string | null;
  search_snippet?: string | null;
  file_url: string;
  file_name: string;
  file_size_human: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  document_types: TaxonomyItem[];
  brands: TaxonomyItem[];
  applications: TaxonomyItem[];
  solutions: TaxonomyItem[];
  product_categories: TaxonomyItem[];
  locations: TaxonomyItem[];
  all_tags: string[];
}

export interface FilterOptions {
  document_types: TaxonomyItem[];
  brands: TaxonomyItem[];
  applications: TaxonomyItem[];
  solutions: TaxonomyItem[];
  product_categories: TaxonomyItem[];
  locations: TaxonomyItem[];
}

export interface DocumentFilters {
  document_type?: string;
  brand?: string;
  application?: string;
  solution?: string;
  product_category?: string;
  location?: string;
  search?: string;
  per_page?: string;
  page?: string;
}
