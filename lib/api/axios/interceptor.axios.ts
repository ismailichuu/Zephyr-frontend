import { AxiosHeaders, AxiosInstance, AxiosRequestConfig } from "axios";

type RetryRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

type InterceptorOptions = {
  getCookieHeader?: () => Promise<string | undefined>;
};

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error?: unknown) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
      return;
    }
    item.resolve();
  });
  failedQueue = [];
}

function readHeader(headers: unknown, key: string): string | undefined {
  if (!headers) return undefined;

  if (headers instanceof AxiosHeaders) {
    const value = headers.get(key);
    return typeof value === "string" ? value : undefined;
  }

  if (typeof headers === "object") {
    const record = headers as Record<string, unknown>;
    const value = record[key] ?? record[key.toLowerCase()];
    return typeof value === "string" ? value : undefined;
  }

  return undefined;
}

function parseCookiePairs(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return acc;
      acc[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
      return acc;
    }, {} as Record<string, string>);
}

function mergeSetCookie(
  baseCookieHeader: string | undefined,
  setCookieHeader: string[] | string | undefined
): string | undefined {
  const map = baseCookieHeader ? parseCookiePairs(baseCookieHeader) : {};
  const setCookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];

  setCookies.forEach((line) => {
    const cookie = line.split(";")[0]?.trim();
    if (!cookie) return;
    const idx = cookie.indexOf("=");
    if (idx === -1) return;
    map[cookie.slice(0, idx).trim()] = cookie.slice(idx + 1).trim();
  });

  const merged = Object.entries(map)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return merged || undefined;
}

export function attachInterceptor(api: AxiosInstance, options?: InterceptorOptions) {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = (error.config ?? {}) as RetryRequestConfig;
      const isRefreshCall = String(originalRequest.url ?? "").includes("/auth/refresh");

      if (error.response?.status !== 401 || originalRequest._retry || isRefreshCall) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const cookieHeader =
          (await options?.getCookieHeader?.()) ??
          readHeader(originalRequest.headers, "Cookie") ??
          readHeader(api.defaults.headers, "Cookie") ??
          readHeader(api.defaults.headers?.common, "Cookie");

        const refreshResponse = await api.post(
          "/auth/refresh",
          undefined,
          cookieHeader
            ? { withCredentials: true, headers: { Cookie: cookieHeader } }
            : { withCredentials: true }
        );

        if (typeof window === "undefined") {
          const setCookie = refreshResponse.headers?.["set-cookie"] as string[] | string | undefined;
          const mergedCookie = mergeSetCookie(cookieHeader, setCookie);

          if (mergedCookie) {
            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Cookie: mergedCookie,
            };

            api.defaults.headers.common = api.defaults.headers.common ?? {};
            (api.defaults.headers.common as Record<string, string>).Cookie = mergedCookie;
          }
        }

        processQueue();
        return api(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
