import axios from "axios";
import apiClient from "../axios/client.instance.axios";

export async function login(email: string, password: string, isAdmin: boolean) {
  try {
    let res = null;
    console.log(isAdmin)
    if (isAdmin) {
      res = await apiClient.post('/auth/admin/login', {email, password});
    }else{
      res = await apiClient.post('/auth/login', {email, password});
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