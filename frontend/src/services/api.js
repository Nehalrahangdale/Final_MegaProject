import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// ==========================================================
// Request Interceptor: Centralized Bearer Token Injection
// ==========================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================================
// Response Interceptor: Global 401 & Session Expiry Handling
// ==========================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === "/login" || currentPath === "/register";

      const hadToken = localStorage.getItem("token");

      // Clear stale authentication state
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect authenticated users with expired tokens back to login
      if (hadToken && !isAuthPage) {
        window.location.href = "/login?sessionExpired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;