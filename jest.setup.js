/* eslint-env jest */

// Jest setup file - runs before each test file
import '@testing-library/jest-dom';
import React from 'react';

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

// JSDOM doesn't implement scrollIntoView; provide a harmless mock for tests
Element.prototype.scrollIntoView = jest.fn();
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
  // Provide a default `useRouter` mock so components that call
  // `useRouter()` won't throw. Individual tests can still override
  // this with a local module mock or by treating `useRouter` as a jest mock.
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock revalidatePath from next/cache to avoid static generation invariant in tests
jest.mock('next/cache', () => ({
  __esModule: true,
  revalidatePath: jest.fn(),
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
  // Expose jest.fn mocks so individual tests can override behavior with
  // `mockResolvedValue` / `mockReturnValue` when needed.
  createClient: jest.fn().mockResolvedValue(mockSupabase),
  createServiceClient: jest.fn().mockReturnValue(mockSupabase),
}));

// Mock global fetch used by components (e.g., BottomNav) to avoid network calls.
// Use a stable non-jest function so `resetMocks` won't remove the default
// implementation. Tests can still override `global.fetch` per-test when they
// need to assert on calls.
global.fetch = (..._args) => Promise.resolve({ json: async () => ({ hasTrips: true }) });

// Mock react-google-autocomplete to a simple input so tests can type into it.
jest.mock('react-google-autocomplete', () => {
  return {
    __esModule: true,
    // Render a small stateful input so userEvent typing updates the value and
    // the component calls `onPlaceSelected` with the full typed address.
    default: (props) => {
      const Comp = () => {
        const [val, setVal] = React.useState(props.value || '');
        return React.createElement('input', {
          placeholder: props.placeholder || '',
          value: val,
          onChange: (e) => {
            const v = e.target.value;
            setVal(v);
          },
          onBlur: () => {
            if (props.onPlaceSelected) {
              props.onPlaceSelected({ formatted_address: val, address_components: [] });
            }
          },
          'data-testid': props['data-testid'] || undefined,
        });
      };
      return React.createElement(Comp, {});
    },
  };
});

// Mock react-datepicker to render a simple input that calls onChange with a Date
jest.mock('react-datepicker', () => {
  return {
    __esModule: true,
    default: (props) =>
      React.createElement('input', {
        placeholder: props.placeholderText || '',
        value: props.selected ? props.selected.toString() : '',
        onChange: () => {
          if (props.onChange) props.onChange(new Date());
        },
        onClick: () => {
          if (props.onChange) props.onChange(new Date());
        },
        disabled: props.disabled || false,
      }),
  };
});
