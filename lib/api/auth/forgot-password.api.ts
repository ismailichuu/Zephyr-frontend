import axios from "axios";
import apiClient from "../axios/client.instance.axios";

export const forgotPassword = async (email: string) => {
  try {
    const res = await apiClient.post('auth/forgot-password', { email });
    const sessionId = res.data?.otpSessionId;
    localStorage.setItem('otpSessionId', sessionId);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "forgot password failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}

