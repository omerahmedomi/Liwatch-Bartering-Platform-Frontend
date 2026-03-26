import axios from "axios";


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor - attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("liwatch_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// response interceptor: authorization
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // invalid or expired token
      localStorage.removeItem("liwatch_token");
      window.location.href = "/auth?mode=login";
    }
    return Promise.reject(error);
  }
);

export default api;
