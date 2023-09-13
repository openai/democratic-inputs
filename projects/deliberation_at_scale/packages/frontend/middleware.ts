import { match } from '@formatjs/intl-localematcher';
import { locales, defaultLocale } from './locales';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Initialize the response
    const res = NextResponse.next();

    // Check if the pathname is missing a locale
    const pathname = req.nextUrl.pathname;
    const pathnameIsMissingLocale = locales.every((l) => (
        !pathname.startsWith(`/${l}/`) && pathname !== `/${l}`
    ));
    
    // GUARD: If the locale is missing, we'll redirect
    if (pathnameIsMissingLocale) {
        // Determine the current locale for the page
        const languages = new Negotiator({ headers: Object.fromEntries(req.headers) }).languages();
        const locale = match(languages, locales, defaultLocale);

        return NextResponse.redirect(
            new URL(`/${locale}/${pathname}`, req.url)
        );
    }

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    await supabase.auth.getSession();

    return res;
}

export const config = {
    // Skip all paths that should not be internationalized. This example skips the
    // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
    matcher: ['/((?!api|_next|.*\\..*).*)']
};