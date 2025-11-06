import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  
  // Try to get locale from cookie first
  let locale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // If not in cookie, try to get from user profile
  if (!locale) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              // Cookie writes are not allowed in this context during the i18n
              // request lifecycle. Supabase may attempt to refresh auth cookies
              // here; ignore the request and let the middleware handle it.
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              cookiesToSet.forEach(() => {});
            },
          },
        }
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('language')
          .eq('id', user.id)
          .single();
          
        if (profile?.language) {
          locale = profile.language;
        }
      }
    } catch (error) {
      // Fallback to default
    }
  }
  
  // Default to English if still no locale
  locale = locale || 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

