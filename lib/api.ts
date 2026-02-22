import axios, { AxiosError } from 'axios';
import { getToken, removeToken } from './auth';

const baseURL =
  typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth (backend: POST /auth/login → { access_token, user })
export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name?: string;
    email?: string;
    role: string;
    phone?: string;
    stores: unknown[];
  };
}

// Categories (backend: /admin/categories)
export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CategoriesListResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    sortBy: string;
    sortOrder: string;
  };
  items: Category[];
}

export interface CreateCategoryBody {
  name: string;
  description?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
}

// Bootstrap first admin (POST /admin/bootstrap, header x-admin-bootstrap-secret)
export interface BootstrapBody {
  name: string;
  email: string;
  password: string;
}

export interface BootstrapResponse {
  access_token: string;
  user: LoginResponse['user'];
}

/** Call bootstrap without storing the secret. Uses plain axios (no Bearer). */
export async function bootstrapAdmin(secret: string, body: BootstrapBody): Promise<BootstrapResponse> {
  const { data } = await axios.post<BootstrapResponse>(`${baseURL}/admin/bootstrap`, body, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-bootstrap-secret': secret.trim(),
    },
  });
  return data;
}

// =====================
// Attributes & Options
// =====================

// Backend entities (as returned by GET /admin/categories/:categoryId/attributes)
export interface AttributeOption {
  id: number;
  categoryAttributeId: number; // exists in your backend mock
  label: string;
  value: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryAttribute {
  id: number;
  categoryId: number;
  name: string;
  slug?: string; // keep optional; some backends don’t expose it
  type: string;  // could be AttributeType enum, keep string for now
  isRequired: boolean; // ✅ backend uses isRequired (not required)
  displayOrder: number;
  description?: string | null;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string | null;
  group?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  options?: AttributeOption[];
  _count?: { values: number };
  createdAt?: string;
  updatedAt?: string;
}

// DTOs expected by backend
// POST /admin/categories/:categoryId/attributes
export interface CreateCategoryAttributeBody {
  name: string;
  type: string;
  isRequired?: boolean;
  displayOrder?: number;
  description?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string;
  group?: string;
  minValue?: number;
  maxValue?: number;
}

// PATCH /admin/attributes/:attributeId
export interface UpdateCategoryAttributeBody {
  name?: string;
  type?: string;
  isRequired?: boolean;
  displayOrder?: number;
  description?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  unit?: string;
  group?: string;
  minValue?: number;
  maxValue?: number;
}

// POST /admin/attributes/:attributeId/options
export interface CreateAttributeOptionBody {
  label: string;          // ✅ backend uses label
  value: string;          // ✅ backend uses value
  displayOrder?: number;
}

// PATCH /admin/attributes/:attributeId/options/:optionId
export interface UpdateAttributeOptionBody {
  label?: string;
  value?: string;
  displayOrder?: number;
}