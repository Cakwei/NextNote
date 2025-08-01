import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectedRoutes } from "./constants/constants";

export function middleware(req: NextRequest) {
  // Temporary
  const isLoggedIn = true;
  if (
    protectedRoutes.find((item) => req.nextUrl.pathname === item) &&
    !isLoggedIn
  ) {
    // Redirect to a new URL
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
export const config = {
  // Match all paths except those starting with _next/static, _next/image, and favicon.ico
  // This is a common pattern to exclude static assets.
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (if you want to exclude all API routes, though often middleware is used for APIs)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
