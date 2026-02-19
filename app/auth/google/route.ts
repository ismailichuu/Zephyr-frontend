import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ERROR = "Authentication failed. Please try again.";
const ERROR_CODE_TO_MESSAGE: Record<string, string> = {
  ROLE_MISMATCH: "This Google account is already registered with a different role.",
};

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    message?: unknown;
    error?: unknown;
    response?: { message?: unknown; error?: unknown };
  };

  console.log(payload)

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

function getErrorRedirectUrl(request: NextRequest) {
  const redirectOnError = request.nextUrl.searchParams.get("redirectOnError") || "/signin";
  const redirectUrl = new URL(redirectOnError, request.nextUrl.origin);
  return redirectUrl;
}

function getErrorRedirectResponse(request: NextRequest, message: string) {
  const response = NextResponse.redirect(getErrorRedirectUrl(request));
  response.cookies.set("authErrorToast", message, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60,
  });
  return response;
}

function getSanitizedRedirectUrl(location: string, request: NextRequest) {
  const redirectUrl = new URL(location, request.nextUrl.origin);
  const errorCode = redirectUrl.searchParams.get("authErrorCode");
  if (!errorCode) {
    return { redirectUrl, toastMessage: null as string | null };
  }

  redirectUrl.searchParams.delete("authErrorCode");
  const toastMessage = ERROR_CODE_TO_MESSAGE[errorCode] ?? DEFAULT_ERROR;
  return { redirectUrl, toastMessage };
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
    return getErrorRedirectResponse(request, "Google auth is not configured on frontend environment.");
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
      const { redirectUrl, toastMessage } = getSanitizedRedirectUrl(location, request);
      const redirectResponse = NextResponse.redirect(redirectUrl);

      if (toastMessage) {
        redirectResponse.cookies.set("authErrorToast", toastMessage, {
          httpOnly: false,
          sameSite: "lax",
          secure: true,
          path: "/",
          maxAge: 60,
        });
      }

      return redirectResponse;
    }

    let message = DEFAULT_ERROR;

    try {
      const data = await response.json();
      const extractedMessage = extractMessage(data);
      if (extractedMessage) message = extractedMessage;
    } catch {
      // Non-JSON response body; keep default error.
    }

    return getErrorRedirectResponse(request, message);
  } catch {
    return getErrorRedirectResponse(request, DEFAULT_ERROR);
  }
}
