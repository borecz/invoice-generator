import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: "en" }),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, values?: Record<string, any>) => {
      // Return a mock translation that includes the namespace and key for testing
      const fullKey = namespace ? `${namespace}.${key}` : key;
      if (values) {
        // Simple interpolation for testing
        let result = fullKey;
        Object.entries(values).forEach(([k, v]) => {
          result = result.replace(`{${k}}`, String(v));
        });
        return result;
      }
      return fullKey;
    };
  },
  useLocale: () => "en",
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock next-intl/server
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => (key: string) => key),
  getLocale: vi.fn(() => "en"),
  getMessages: vi.fn(() => ({})),
  getRequestConfig: vi.fn(() => ({
    locale: "en",
    messages: {},
  })),
}));

// Mock the locale context
vi.mock("@/app/contexts/LocaleContext", () => ({
  useLocaleContext: () => ({
    currentCountry: "US",
    currentLanguage: "en",
    setCountry: vi.fn(),
    setLanguage: vi.fn(),
  }),
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Supabase
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: "div",
    span: "span",
    button: "button",
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
