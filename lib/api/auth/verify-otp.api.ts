import axios from "axios";
import api from "../axios";

export type VerifyOtpResponse = {
  verified: boolean;
  user?: {
    name: string;
    _id: string;
    email: string;
    role: "client" | "freelancer";
  };
};

export const verifyOtp = async (
  otp: string,
  type: 'signup' | 'forgot',
): Promise<VerifyOtpResponse> => {
  try {
    const otpSessionId = localStorage.getItem('otpSessionId');
    const res = await api.post<VerifyOtpResponse>(
      "auth/verify-otp",
      { otp, otpSessionId, type }
    );
    localStorage.removeItem('otpSessionId');
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Invalid OTP. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
};


