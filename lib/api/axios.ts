import axios from 'axios';

const api = axios.create({
  timeout: 60000,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

export default api;


//interceptor
let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any) {
  failedQueue.forEach(p => p.reject(error));
  failedQueue = [];
}

axios.interceptors.response.use((res) => res, async (error) => {
  const orginalRequest = error.config;

  if(error.response?.status === '404' && !orginalRequest._retry) {
    orginalRequest._retry = true;
    
    if(isRefreshing) {
      return new Promise((_, reject) => {
        failedQueue.push({ reject });
      })
    }

    isRefreshing = true;

    try{
      await api.post('/auth/login');
      isRefreshing = false;
      return api(orginalRequest);
    }catch(err) {
      isRefreshing = false;
      processQueue(err);
      return Promise.reject(err);
    }
  }

  return Promise.reject(error);
})