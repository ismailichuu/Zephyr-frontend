import axios from "axios";
import api from "../axios";

export const resetPassword = async (password: string) => {
  try {
    const res = await api.patch('auth/change-password', { password });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "change password failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}

