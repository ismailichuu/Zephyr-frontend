import axios from "axios";
import apiClient from "../axios/client.instance.axios";

export type ResendOtpResponse = {
  verified: boolean;
  sessionId: string;
};

export const resendOtp = async (): Promise<ResendOtpResponse> => {
  try {
    const sessionId = localStorage.getItem('otpSessionId');
    const res = await apiClient.post<ResendOtpResponse>(
      "auth/resend-otp",
      { sessionId },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Resend OTP failed! Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
};


