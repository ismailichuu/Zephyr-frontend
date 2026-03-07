import axios from "axios";
import apiClient from "../axios/client.instance.axios";

export async function logOut() {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  } catch (error) {
     if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Logout failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}