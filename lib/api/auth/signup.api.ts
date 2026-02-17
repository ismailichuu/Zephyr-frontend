import axios from "axios";
import api from "../axios";

export type SignupData = {
  name: string,
  email: string,
  password: string,
  role: string,
};

export const signup = async (data: SignupData) => {
  try {
    const res = await api.post('auth/signup', data);
    const sessionId = res.data?.otpSessionId;
    console.log(res.data)
    localStorage.setItem('otpSessionId', sessionId);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Signup failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}

