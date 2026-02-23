import axios from "axios";
import api from "../axios"

export const adminAction = async (userId: string, action: string) => {
  try {
    const res = await api.patch('/admin/user', {
      userId,
      action
    })
    return res.data;
    
  } catch (error: unknown) {
    if(axios.isAxiosError(error)) {
      throw {
        message: 
        error.response?.data?.message ?? 
        "admin action error. please try again.",
        statusCode: error.response?.status,
      }
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
  
}