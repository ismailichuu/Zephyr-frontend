import axios from "axios";
import api from "../axios";

export const googleLogin = async (isLogin = false, idToken: string, role?: string) => {
  const res = await api.post("auth/google", {
    idToken,
    role,
    isLogin,
  });
  try{
    return res.data;
  }catch(error) {
    console.log(error);
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
};
