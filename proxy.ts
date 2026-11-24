import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

// Must match AdminAuthInterceptor.ACCESS_COOKIE in the Spring Boot backend.
const ADMIN_COOKIE = "ezkey_admin_at";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panel: /admin/** needs an admin session cookie, otherwise go to the
  // admin login. This is only a fast UX gate - the Spring Boot backend verifies
  // the token and the admin role on every /admin-api request.
  if (
    (pathname === "/admin" || pathname.startsWith("/admin/")) &&
    pathname !== "/admin/login" &&
    !request.cookies.get(ADMIN_COOKIE)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (pathname !== "/admin") {
      url.searchParams.set("redirectedFrom", `${pathname}${request.nextUrl.search}`);
    }
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp, .avif, .ico
     * - media  - .mp4, .webm, .mov (videos are fetched in many Range
     *   requests; running the Supabase session check on each one is wasted work)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|mov)$).*)",
  ],
};
