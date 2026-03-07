import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATHS = ["/portfolio"];

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(es|en)/, "");
  return PROTECTED_PATHS.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(`${p}/`)
  );
}

export async function middleware(request: NextRequest) {
  // Intercept Supabase auth confirmation codes and redirect to callback handler
  const code = request.nextUrl.searchParams.get("code");
  if (code && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    return NextResponse.redirect(callbackUrl);
  }

  const intlResponse = intlMiddleware(request);

  const { user, response } = await updateSession(
    request,
    intlResponse || NextResponse.next()
  );

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const locale =
      request.nextUrl.pathname.match(/^\/(es|en)/)?.[1] ||
      routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/(es|en)/:path*", "/auth/callback"],
};
