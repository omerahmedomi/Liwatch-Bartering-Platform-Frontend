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
    const status = error.response?.status;
    const url = error.config?.url;

    const isAuthRequest =
      url?.includes("/api/auth/login") || url?.includes("/api/auth/register");

    if (status === 401 && !isAuthRequest) {
      // only redirect for protected routes
      localStorage.removeItem("liwatch_token");
      window.location.href = "/auth?mode=login";
    }

    if (status === 403 && (error.response?.data === "Your account has been suspended." || error.response?.data?.message === "Your account has been suspended.")) {
      localStorage.removeItem("liwatch_token");
      window.location.href = "/auth?mode=login&error=suspended";
    }
    return Promise.reject(error);
  },
);

export default api;
