import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If there's an error getting user, continue without blocking
    if (userError) {
      console.error('Auth error:', userError);
      return supabaseResponse;
    }

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isOnboarding = request.nextUrl.pathname === '/onboarding';
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isHome = request.nextUrl.pathname === '/';

  // If user is not logged in and trying to access protected routes
  if (!user && (isDashboard || isOnboarding)) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

    // If user is logged in
    if (user) {
      try {
        // Check if user has organization
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        // If profile query fails, continue without blocking
        if (profileError) {
          console.error('Profile query error:', profileError);
          return supabaseResponse;
        }

        const hasOrganization = profile?.organization_id;

        // Redirect to onboarding if no organization (except if already on onboarding or auth pages)
        if (!hasOrganization && !isOnboarding && !isAuthPage) {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding';
          return NextResponse.redirect(url);
        }

        // Redirect to dashboard if has organization and on home/auth/onboarding
        if (hasOrganization && (isHome || isAuthPage || isOnboarding)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error('Middleware error:', error);
        return supabaseResponse;
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware initialization error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

