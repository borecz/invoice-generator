import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/app/components/layout/Header";
import { LanguageCountrySwitcher } from "@/app/components/ui/LanguageCountrySwitcher";
import { LocaleProvider } from "@/app/contexts/LocaleContext";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en",
  useParams: () => ({ locale: "en" }),
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

// Complete translation messages for snapshot testing
const createMessages = (locale: string) => ({
  navigation: {
    features:
      locale === "en"
        ? "Features"
        : locale === "de"
        ? "Funktionen"
        : locale === "nl"
        ? "Functies"
        : locale === "fr"
        ? "Fonctionnalités"
        : locale === "it"
        ? "Caratteristiche"
        : locale === "es"
        ? "Características"
        : locale === "cs"
        ? "Funkce"
        : locale === "ru"
        ? "Функции"
        : "Features",
    pricing:
      locale === "en"
        ? "Pricing"
        : locale === "de"
        ? "Preise"
        : locale === "nl"
        ? "Prijzen"
        : locale === "fr"
        ? "Tarifs"
        : locale === "it"
        ? "Prezzi"
        : locale === "es"
        ? "Precios"
        : locale === "cs"
        ? "Ceny"
        : locale === "ru"
        ? "Цены"
        : "Pricing",
    testimonials:
      locale === "en"
        ? "Testimonials"
        : locale === "de"
        ? "Testimonials"
        : locale === "nl"
        ? "Getuigenissen"
        : locale === "fr"
        ? "Témoignages"
        : locale === "it"
        ? "Testimonianze"
        : locale === "es"
        ? "Testimonios"
        : locale === "cs"
        ? "Reference"
        : locale === "ru"
        ? "Отзывы"
        : "Testimonials",
    dashboard:
      locale === "en"
        ? "Dashboard"
        : locale === "de"
        ? "Dashboard"
        : locale === "nl"
        ? "Dashboard"
        : locale === "fr"
        ? "Tableau de bord"
        : locale === "it"
        ? "Dashboard"
        : locale === "es"
        ? "Panel"
        : locale === "cs"
        ? "Přehled"
        : locale === "ru"
        ? "Панель"
        : "Dashboard",
    login:
      locale === "en"
        ? "Login"
        : locale === "de"
        ? "Anmelden"
        : locale === "nl"
        ? "Inloggen"
        : locale === "fr"
        ? "Connexion"
        : locale === "it"
        ? "Accedi"
        : locale === "es"
        ? "Iniciar sesión"
        : locale === "cs"
        ? "Přihlásit"
        : locale === "ru"
        ? "Войти"
        : "Login",
    signup:
      locale === "en"
        ? "Get Started"
        : locale === "de"
        ? "Loslegen"
        : locale === "nl"
        ? "Beginnen"
        : locale === "fr"
        ? "Commencer"
        : locale === "it"
        ? "Inizia"
        : locale === "es"
        ? "Empezar"
        : locale === "cs"
        ? "Začít"
        : locale === "ru"
        ? "Начать"
        : "Get Started",
  },
  languageCountrySwitcher: {
    title:
      locale === "en"
        ? "Language and Country"
        : locale === "de"
        ? "Sprache und Land"
        : locale === "nl"
        ? "Taal en Land"
        : locale === "fr"
        ? "Langue et Pays"
        : locale === "it"
        ? "Lingua e Paese"
        : locale === "es"
        ? "Idioma y País"
        : locale === "cs"
        ? "Jazyk a Země"
        : locale === "ru"
        ? "Язык и Страна"
        : "Language and Country",
    country:
      locale === "en"
        ? "Country"
        : locale === "de"
        ? "Land"
        : locale === "nl"
        ? "Land"
        : locale === "fr"
        ? "Pays"
        : locale === "it"
        ? "Paese"
        : locale === "es"
        ? "País"
        : locale === "cs"
        ? "Země"
        : locale === "ru"
        ? "Страна"
        : "Country",
    language:
      locale === "en"
        ? "Language"
        : locale === "de"
        ? "Sprache"
        : locale === "nl"
        ? "Taal"
        : locale === "fr"
        ? "Langue"
        : locale === "it"
        ? "Lingua"
        : locale === "es"
        ? "Idioma"
        : locale === "cs"
        ? "Jazyk"
        : locale === "ru"
        ? "Язык"
        : "Language",
    selectCountryLabel:
      locale === "en"
        ? "Select Country"
        : locale === "de"
        ? "Land auswählen"
        : locale === "nl"
        ? "Selecteer Land"
        : locale === "fr"
        ? "Sélectionner le Pays"
        : locale === "it"
        ? "Seleziona Paese"
        : locale === "es"
        ? "Seleccionar País"
        : locale === "cs"
        ? "Vybrat Zemi"
        : locale === "ru"
        ? "Выбрать Страну"
        : "Select Country",
    selectLanguageLabel:
      locale === "en"
        ? "Select Language"
        : locale === "de"
        ? "Sprache auswählen"
        : locale === "nl"
        ? "Selecteer Taal"
        : locale === "fr"
        ? "Sélectionner la Langue"
        : locale === "it"
        ? "Seleziona Lingua"
        : locale === "es"
        ? "Seleccionar Idioma"
        : locale === "cs"
        ? "Vybrat Jazyk"
        : locale === "ru"
        ? "Выбрать Язык"
        : "Select Language",
    current:
      locale === "en"
        ? "Current"
        : locale === "de"
        ? "Aktuell"
        : locale === "nl"
        ? "Huidig"
        : locale === "fr"
        ? "Actuel"
        : locale === "it"
        ? "Attuale"
        : locale === "es"
        ? "Actual"
        : locale === "cs"
        ? "Aktuální"
        : locale === "ru"
        ? "Текущий"
        : "Current",
  },
  countries: {
    US:
      locale === "en"
        ? "United States"
        : locale === "de"
        ? "Vereinigte Staaten"
        : locale === "nl"
        ? "Verenigde Staten"
        : locale === "fr"
        ? "États-Unis"
        : locale === "it"
        ? "Stati Uniti"
        : locale === "es"
        ? "Estados Unidos"
        : locale === "cs"
        ? "Spojené státy"
        : locale === "ru"
        ? "Соединенные Штаты"
        : "United States",
    DE:
      locale === "en"
        ? "Germany"
        : locale === "de"
        ? "Deutschland"
        : locale === "nl"
        ? "Duitsland"
        : locale === "fr"
        ? "Allemagne"
        : locale === "it"
        ? "Germania"
        : locale === "es"
        ? "Alemania"
        : locale === "cs"
        ? "Německo"
        : locale === "ru"
        ? "Германия"
        : "Germany",
    NL:
      locale === "en"
        ? "Netherlands"
        : locale === "de"
        ? "Niederlande"
        : locale === "nl"
        ? "Nederland"
        : locale === "fr"
        ? "Pays-Bas"
        : locale === "it"
        ? "Paesi Bassi"
        : locale === "es"
        ? "Países Bajos"
        : locale === "cs"
        ? "Nizozemsko"
        : locale === "ru"
        ? "Нидерланды"
        : "Netherlands",
  },
  languages: {
    en:
      locale === "en"
        ? "English"
        : locale === "de"
        ? "Englisch"
        : locale === "nl"
        ? "Engels"
        : locale === "fr"
        ? "Anglais"
        : locale === "it"
        ? "Inglese"
        : locale === "es"
        ? "Inglés"
        : locale === "cs"
        ? "Angličtina"
        : locale === "ru"
        ? "Английский"
        : "English",
    de:
      locale === "en"
        ? "German"
        : locale === "de"
        ? "Deutsch"
        : locale === "nl"
        ? "Duits"
        : locale === "fr"
        ? "Allemand"
        : locale === "it"
        ? "Tedesco"
        : locale === "es"
        ? "Alemán"
        : locale === "cs"
        ? "Němčina"
        : locale === "ru"
        ? "Немецкий"
        : "German",
    nl:
      locale === "en"
        ? "Dutch"
        : locale === "de"
        ? "Niederländisch"
        : locale === "nl"
        ? "Nederlands"
        : locale === "fr"
        ? "Néerlandais"
        : locale === "it"
        ? "Olandese"
        : locale === "es"
        ? "Holandés"
        : locale === "cs"
        ? "Nizozemština"
        : locale === "ru"
        ? "Голландский"
        : "Dutch",
  },
});

const TestWrapper = ({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: string;
}) => (
  <NextIntlClientProvider locale={locale} messages={createMessages(locale)}>
    <LocaleProvider>{children}</LocaleProvider>
  </NextIntlClientProvider>
);

describe("Snapshot Testing for UI Components", () => {
  const COMPLETE_LOCALES = ["en", "de", "nl", "fr", "it", "es", "cs", "ru"];

  describe("Header Component Snapshots", () => {
    COMPLETE_LOCALES.forEach((locale) => {
      it(`should render Header correctly in ${locale}`, () => {
        const { container } = render(
          <TestWrapper locale={locale}>
            <Header />
          </TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(`header-${locale}`);
      });
    });

    it("should render Header consistently across locales", () => {
      const snapshots = COMPLETE_LOCALES.map((locale) => {
        const { container } = render(
          <TestWrapper locale={locale}>
            <Header />
          </TestWrapper>
        );
        return container.innerHTML;
      });

      // All snapshots should have similar structure but different text
      snapshots.forEach((snapshot, index) => {
        const locale = COMPLETE_LOCALES[index];

        // Should contain navigation elements
        expect(snapshot).toContain("nav");

        // Should contain language switcher button
        expect(snapshot).toMatch(/button.*🇺🇸|🇩🇪|🇳🇱|🇫🇷|🇮🇹|🇪🇸|🇨🇿|🇷🇺/);

        // Should contain localized navigation text
        if (locale === "de") {
          expect(snapshot).toContain("Funktionen");
          expect(snapshot).toContain("Preise");
        } else if (locale === "nl") {
          expect(snapshot).toContain("Functies");
          expect(snapshot).toContain("Prijzen");
        } else if (locale === "fr") {
          expect(snapshot).toContain("Fonctionnalités");
          expect(snapshot).toContain("Tarifs");
        }
      });
    });
  });

  describe("Language Country Switcher Snapshots", () => {
    COMPLETE_LOCALES.forEach((locale) => {
      it(`should render LanguageCountrySwitcher correctly in ${locale}`, () => {
        const { container } = render(
          <TestWrapper locale={locale}>
            <LanguageCountrySwitcher />
          </TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(
          `language-switcher-${locale}`
        );
      });

      it(`should render LanguageCountrySwitcher dropdown correctly in ${locale}`, async () => {
        const { container, getByRole } = render(
          <TestWrapper locale={locale}>
            <LanguageCountrySwitcher />
          </TestWrapper>
        );

        // Open the dropdown
        const trigger = getByRole("button");
        trigger.click();

        // Wait for dropdown to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(container).toMatchSnapshot(
          `language-switcher-dropdown-${locale}`
        );
      });
    });
  });

  describe("Landing Page Section Snapshots", () => {
    const mockLandingSection = (locale: string, section: string) => (
      <div data-testid={`${section}-section`} className="landing-section">
        <h2>{createMessages(locale).navigation.features}</h2>
        <p>
          Sample content for {section} in {locale}
        </p>
        <button>{createMessages(locale).navigation.signup}</button>
      </div>
    );

    const sections = ["hero", "features", "pricing", "testimonials"];

    sections.forEach((section) => {
      COMPLETE_LOCALES.forEach((locale) => {
        it(`should render ${section} section correctly in ${locale}`, () => {
          const { container } = render(
            <TestWrapper locale={locale}>
              {mockLandingSection(locale, section)}
            </TestWrapper>
          );

          expect(container.firstChild).toMatchSnapshot(
            `${section}-section-${locale}`
          );
        });
      });
    });
  });

  describe("Responsive Design Snapshots", () => {
    const viewports = [
      { name: "mobile", width: 375 },
      { name: "tablet", width: 768 },
      { name: "desktop", width: 1024 },
    ];

    viewports.forEach(({ name, width }) => {
      it(`should render Header responsively on ${name} (${width}px)`, () => {
        // Mock viewport width
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        const { container } = render(
          <TestWrapper locale="en">
            <Header />
          </TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(
          `header-${name}-${width}px`
        );
      });
    });
  });

  describe("Theme Variation Snapshots", () => {
    const themes = ["light", "dark"];

    themes.forEach((theme) => {
      it(`should render components correctly in ${theme} theme`, () => {
        // Mock theme class
        document.documentElement.className = theme;

        const { container } = render(
          <TestWrapper locale="en">
            <div className={`theme-${theme}`}>
              <Header />
              <LanguageCountrySwitcher />
            </div>
          </TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(
          `components-${theme}-theme`
        );

        // Cleanup
        document.documentElement.className = "";
      });
    });
  });

  describe("Error State Snapshots", () => {
    it("should render error states consistently across locales", () => {
      const errorComponent = (locale: string) => (
        <div className="error-state">
          <h3>Error</h3>
          <p>Something went wrong in {locale}</p>
          <button>Retry</button>
        </div>
      );

      COMPLETE_LOCALES.forEach((locale) => {
        const { container } = render(
          <TestWrapper locale={locale}>{errorComponent(locale)}</TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(`error-state-${locale}`);
      });
    });
  });

  describe("Loading State Snapshots", () => {
    it("should render loading states consistently across locales", () => {
      const loadingComponent = (locale: string) => (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading in {locale}...</p>
        </div>
      );

      COMPLETE_LOCALES.forEach((locale) => {
        const { container } = render(
          <TestWrapper locale={locale}>{loadingComponent(locale)}</TestWrapper>
        );

        expect(container.firstChild).toMatchSnapshot(`loading-state-${locale}`);
      });
    });
  });
});
