import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { protectedRoutes } from "./constants/constants";
import { cookies } from "next/headers";
import { verifyToken } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const middlewares = [convertURLTolowerCase, checkUserLoggedIn];

  let response = NextResponse.next();
  for (const mw of middlewares) {
    response = (await mw(req)) || response;
  }
  return response;
}

// Others //
function convertURLTolowerCase(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname !== pathname.toLowerCase()) {
    // If not, redirect to the lowercase version
    return NextResponse.redirect(new URL(pathname.toLowerCase(), req.url));
  }
  return NextResponse.next();
}

async function checkUserLoggedIn(req: NextRequest) {
  try {
    const token = (await cookies()).get("auth")?.value || "";
    const isTokenVerified = await verifyToken(token);

    // If entering protected route and cannot be authenticated
    if (
      protectedRoutes.find((item) => req.nextUrl.pathname === item) &&
      !isTokenVerified
    ) {
      // Redirect to a new URL
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (
      isTokenVerified &&
      (req.nextUrl.pathname === "/login" ||
        req.nextUrl.pathname === "/register")
    ) {
      // Redirect to a new URL
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    console.log("A user logged in", req.nextUrl.pathname);
  } catch (e) {
    console.log(e);
  }
}

export const config = {
  // Match all paths except those starting with _next/static, _next/image, and favicon.ico
  // This is a common pattern to exclude static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
