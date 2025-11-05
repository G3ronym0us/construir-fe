import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get locale from cookie or header
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale: string = cookieStore.get('NEXT_LOCALE')?.value || '';

  // If no cookie, check Accept-Language header
  if (!locale) {
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
      locale = locales.includes(preferredLocale as Locale) ? preferredLocale : 'es';
    } else {
      locale = 'es';
    }
  }

  // Validate locale - default to 'es' if invalid
  if (!locales.includes(locale as Locale)) {
    locale = 'es';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
