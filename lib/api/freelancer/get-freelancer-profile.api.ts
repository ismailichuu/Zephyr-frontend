import axios from "axios";
import { createServerApi } from "../axios/server.instance.axios";

export const getFreelancerProfile = async () => {
  try {
    const api = await createServerApi();
    const res = await api.get('freelancer/profile');
    return res.data;
  } catch (error) {
     if(axios.isAxiosError(error)) {
      throw {
        message: 
        error.response?.data?.message ?? 
        "fetch profile error. please try again.",
        statusCode: error.response?.status,
      }
    }

    throw {
      message: "Unexpected error occurred",
    };
  }
  
}