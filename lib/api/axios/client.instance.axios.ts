import axios from "axios";
import { attachInterceptor } from "./interceptor.axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 60000,
})

attachInterceptor(apiClient);

export default apiClient;
