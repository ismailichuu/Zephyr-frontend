import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "./lib/constants/routes.constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  if (
    pathname.startsWith(ROUTES.ADMIN.ROOT) ||
    pathname.startsWith(ROUTES.FREELANCER.ROOT) ||
    pathname.startsWith(ROUTES.CLIENT.ROOT)
  ) {
    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN.ROOT, request.url));
    }

    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      const role: string = (payload.role).toLowerCase();

      if (pathname.startsWith(ROUTES.ADMIN.ROOT) && role !== "admin") {
        return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, request.url));
      }

      if (pathname.startsWith(ROUTES.FREELANCER.ROOT) && role !== "freelancer") {
        return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, request.url));
      }

      if (pathname.startsWith(ROUTES.CLIENT.ROOT) && role !== "client") {
        return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL(ROUTES.SIGN_IN.ROOT, request.url));
    }
  }

  if (pathname === ROUTES.SIGN_IN.ROOT || pathname === ROUTES.SIGNUP.ROOT || pathname === ROUTES.LANDING_PAGE) {
    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );

        const role: string = payload.role.toLowerCase();

        if (role === "admin") {
          return NextResponse.redirect(new URL(ROUTES.ADMIN.ROOT, request.url));
        }

        if (role === "freelancer") {
          return NextResponse.redirect(new URL(ROUTES.FREELANCER.ROOT, request.url));
        }

        if (role === "client") {
          return NextResponse.redirect(new URL(ROUTES.CLIENT.ROOT, request.url));
        }

      } catch (err) {
        return NextResponse.next();
      }
    }
  }

  const response = NextResponse.next();
  if (
    pathname.startsWith(ROUTES.SIGN_IN.ROOT) ||
    pathname.startsWith(ROUTES.SIGNUP.ROOT) ||
    pathname.startsWith(ROUTES.FORGOT_PASSWORD.ROOT)
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}
