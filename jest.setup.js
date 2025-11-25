/* eslint-env jest */

// Jest setup file - runs before each test file
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-maps-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Suppress console errors in tests (optioneel)
// global.console = {
//   ...console,
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// Provide a lightweight mock for the Toast context so components using useToast
// don't throw when rendered in unit tests. Tests that rely on toast behavior
// should still mock/show expectations explicitly.
jest.mock('@/contexts/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({ showToast: jest.fn() }),
}));

// Mock Next.js App Router navigation hooks used by components (usePathname, etc.).
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  // If tests call other router helpers, you can extend this mock.
}));

// Mock server-side Supabase client factory used by server actions.
// This provides lightweight, chainable methods so tests that import
// server actions won't throw. It returns neutral results; integration
// tests that expect DB behavior should still mock/spy per-test.
const mockQuery = {
  insert() {
    return this;
  },
  update() {
    return this;
  },
  delete() {
    return this;
  },
  select() {
    return this;
  },
  eq() {
    return Promise.resolve({ data: null, error: null });
  },
  single() {
    return Promise.resolve({ data: null, error: null });
  },
};

const mockSupabase = {
  from: () => mockQuery,
  auth: {
    getUser: async () => ({ data: { user: null } }),
  },
};

jest.mock('@/lib/supabase/server', () => ({
  __esModule: true,
  createClient: async () => mockSupabase,
  createServiceClient: () => mockSupabase,
}));

// Mock global fetch used by components (e.g., BottomNav) to avoid network calls
global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ hasTrips: true }) });
