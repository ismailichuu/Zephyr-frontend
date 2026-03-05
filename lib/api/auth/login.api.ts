import axios from "axios";
import api from "../axios";

export async function login(email: string, password: string, isAdmin: boolean) {
  try {
    let res = null;
    if (isAdmin) {
      res = await api.post('/auth/admin/login', {email, password});
    }else{
      res = await api.post('/auth/login', {email, password});
    }
    return res.data;
  } catch (error) {
     if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Login failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}