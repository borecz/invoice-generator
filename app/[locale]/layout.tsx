import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { LocaleProvider } from '@/app/contexts/LocaleContext';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
