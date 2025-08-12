import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

// Basic protection example:
// - Protect /dashboard and /admin
// - Enforce role ADMIN for /admin

export default withAuth(
  function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Example admin route guard
    if (url.pathname.startsWith("/admin")) {
      const role = (req as any).nextauth?.token?.role as string | undefined;
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/api/auth/signin", url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
        if (!isProtected) return true; // public routes
        return !!token; // require auth for protected routes
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
