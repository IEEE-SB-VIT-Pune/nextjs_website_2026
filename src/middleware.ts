import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define route check matches
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/profile") || 
    pathname.startsWith("/admin");
    
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  // Extract session token
  const token = request.cookies.get("token")?.value;

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 1. Verify token signature locally (fast check using Edge-safe jose)
    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
      // Clear token and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    try {
      // 2. Fetch User status and database verification via internal API
      const verifyUrl = new URL("/api/auth/verify", request.url);
      const verifyRes = await fetch(verifyUrl, {
        headers: {
          Cookie: `token=${token}`,
        },
      });

      if (!verifyRes.ok) {
        // Clear token and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }

      const data = await verifyRes.json();

      // 3. Check status
      if (data.user.status !== "ACTIVE") {
        const response = NextResponse.redirect(new URL("/login?error=inactive", request.url));
        response.cookies.delete("token");
        return response;
      }

      // 4. Check role authorization
      if (isAdminRoute && data.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
      }

      // Allow request to proceed, appending user header context if needed
      const response = NextResponse.next();
      response.headers.set("x-user-id", data.user.id);
      response.headers.set("x-user-role", data.user.role);
      return response;
    } catch (err) {
      console.error("Middleware verification error:", err);
      // In case of internal fetch errors, fall back to locally decoded payload
      if (isAdminRoute && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
      }
      return NextResponse.next();
    }
  }

  if (isLoginRoute && token) {
    // If logged in, redirect to dashboard
    const payload = await verifyJWT(token);
    if (payload && payload.id) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Config limit middleware to dashboard, profile, login, and admin pages
export const config = {
  matcher: ["/login", "/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
};
