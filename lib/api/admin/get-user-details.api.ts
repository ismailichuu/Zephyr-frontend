import axios from "axios";
import api from "../axios";

export const getUserDetails = async (userId: string) => {
  try {
    const res = await api.get(`/admin/user/${userId}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message:
          error.response?.data?.message ??
          "Fetch user details failed. Please try again.",
        statusCode: error.response?.status,
      };
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
};
