import axios from "axios";
import api from "../axios"

export const getAllUsers = async (page: string | number, limit: string | number, search: string) => {
  try {
    const res = await api.get(`/admin/user?page=${page}&limit=${limit}&search=${search}`);
    return res.data;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      throw {
        message: 
        error.response?.data?.message ?? 
        "fetch user error. please try again.",
        statusCode: error.response?.status,
      }
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
}