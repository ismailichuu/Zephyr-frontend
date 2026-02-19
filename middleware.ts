import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/freelancer") ||
    pathname.startsWith("/client")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      const role: string = (payload.role).toLowerCase();

      if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (pathname.startsWith("/freelancer") && role !== "freelancer") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      if (pathname.startsWith("/client") && role !== "client") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  if (pathname === "/signin" || pathname === "/signup" || pathname === '/') {
    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );

        const role: string = payload.role.toLowerCase();

        if (role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }

        if (role === "freelancer") {
          return NextResponse.redirect(new URL("/freelancer", request.url));
        }

        if (role === "client") {
          return NextResponse.redirect(new URL("/client", request.url));
        }

      } catch (err) {
        return NextResponse.next();
      }
    }
  }

  const response = NextResponse.next();
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}
