import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ERROR = "Authentication failed. Please try again.";

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    message?: unknown;
    error?: unknown;
    response?: { message?: unknown; error?: unknown };
  };

  const candidates: unknown[] = [
    data.response?.message,
    data.message,
    data.response?.error,
    data.error,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }

    if (Array.isArray(candidate)) {
      const firstString = candidate.find((item) => typeof item === "string" && item.trim()) as string | undefined;
      if (firstString) {
        return firstString;
      }
    }
  }

  return null;
}

function getErrorRedirectUrl(request: NextRequest, message: string) {
  const redirectOnError = request.nextUrl.searchParams.get("redirectOnError") || "/signin";
  const redirectUrl = new URL(redirectOnError, request.nextUrl.origin);
  redirectUrl.searchParams.set("authError", message);
  return redirectUrl;
}

function getBackendGoogleUrl(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    return null;
  }

  const backendUrl = new URL("/auth/google", apiBaseUrl);
  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  return backendUrl;
}

export async function GET(request: NextRequest) {
  const backendGoogleUrl = getBackendGoogleUrl(request);

  if (!backendGoogleUrl) {
    return NextResponse.redirect(
      getErrorRedirectUrl(request, "Google auth is not configured on frontend environment."),
    );
  }

  try {
    const response = await fetch(backendGoogleUrl.toString(), {
      method: "GET",
      redirect: "manual",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    const location = response.headers.get("location");
    if (location) {
      return NextResponse.redirect(location);
    }

    let message = DEFAULT_ERROR;

    try {
      const data = await response.json();
      const extractedMessage = extractMessage(data);
      if (extractedMessage) message = extractedMessage;
    } catch {
      // Non-JSON response body; keep default error.
    }

    return NextResponse.redirect(getErrorRedirectUrl(request, message));
  } catch {
    return NextResponse.redirect(getErrorRedirectUrl(request, DEFAULT_ERROR));
  }
}
