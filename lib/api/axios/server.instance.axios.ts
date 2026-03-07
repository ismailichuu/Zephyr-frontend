import axios from "axios";
import { cookies } from "next/headers";
import { attachInterceptor } from "./interceptor.axios";

export async function createServerApi() {
  const cookieHeader = (await cookies()).toString();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 60000,
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  })

  attachInterceptor(api, {
    getCookieHeader: async () => (await cookies()).toString(),
  });

  return api;
}
