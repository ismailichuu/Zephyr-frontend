import { NextRequest, NextResponse } from "next/server";

type RefreshResult = {
  accessToken: string | null;
  setCookies: string[];
};

type SessionResult = {
  payload: Record<string, unknown> | null;
  setCookies: string[];
};

function extractAccessTokenFromSetCookie(setCookie: string): string | null {
  const match = setCookie.match(/(?:^|,)\s*accessToken=([^;]+)/i);
  return match?.[1] ?? null;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function tryRefreshAccessToken(request: NextRequest): Promise<RefreshResult | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  const incomingCookie = request.headers.get("cookie");

  try {
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: incomingCookie ? { Cookie: incomingCookie } : undefined,
      cache: "no-store",
    });

    if (!refreshResponse.ok) return null;

    const getSetCookie = (refreshResponse.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
    const setCookies = typeof getSetCookie === "function"
      ? getSetCookie.call(refreshResponse.headers)
      : [];
    const combinedSetCookie = refreshResponse.headers.get("set-cookie");
    const allSetCookies = setCookies.length
      ? setCookies
      : combinedSetCookie
        ? [combinedSetCookie]
        : [];

    let accessToken =
      allSetCookies.map(extractAccessTokenFromSetCookie).find(Boolean) ?? null;

    if (!accessToken) {
      const responseBody = await refreshResponse.json().catch(() => null) as
        | { accessToken?: string }
        | null;
      accessToken = responseBody?.accessToken ?? null;
    }

    if (!accessToken) return null;

    return { accessToken, setCookies: allSetCookies };
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown> | null): boolean {
  const exp = typeof payload?.exp === "number" ? payload.exp : null;
  return exp !== null && exp <= Math.floor(Date.now() / 1000);
}

function getHomePathByRole(role: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "freelancer") return "/freelancer";
  if (role === "client") return "/client";
  return "/";
}

function appendSetCookies(response: NextResponse, setCookies: string[]) {
  setCookies.forEach((cookie) => response.headers.append("set-cookie", cookie));
}

async function resolveSession(request: NextRequest): Promise<SessionResult> {
  let setCookies: string[] = [];
  let accessToken = request.cookies.get("accessToken")?.value ?? null;
  let payload = accessToken ? parseJwtPayload(accessToken) : null;

  if (!accessToken || !payload || isTokenExpired(payload)) {
    const refreshed = await tryRefreshAccessToken(request);
    if (!refreshed?.accessToken) {
      return { payload: null, setCookies };
    }

    accessToken = refreshed.accessToken;
    setCookies = refreshed.setCookies;
    payload = parseJwtPayload(accessToken);
  }

  if (!payload || isTokenExpired(payload)) {
    return { payload: null, setCookies };
  }

  return { payload, setCookies };
}

export async function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  // Never guard framework/static asset paths.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const session = await resolveSession(request);
  const role = String(session.payload?.role ?? "").toLowerCase() || null;

  if (isAuthRoute && session.payload) {
    const response = NextResponse.redirect(new URL(getHomePathByRole(role), request.url));
    appendSetCookies(response, session.setCookies);
    return response;
  }

  if (!isAuthRoute && !session.payload) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Protect routes
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/freelancer") && role !== "freelancer") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/client") && role !== "client") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const response = NextResponse.next();
  appendSetCookies(response, session.setCookies);

  return response;

}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
