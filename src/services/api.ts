import axios from 'axios';

// Create Axios instance with baseURL mapped to Vite proxy prefix
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Catch 401s and attempt refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent loop if the refresh request itself fails
    if (originalRequest.url === '/v1/auth/refresh') {
      isRefreshing = false;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Dispatch refresh token pair request to backend
        const response = await axios.post('/api/v1/auth/refresh', {
          accessToken,
          refreshToken,
        });

        if (response.data?.success) {
          const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;
          
          localStorage.setItem('accessToken', newAccess);
          localStorage.setItem('refreshToken', newRefresh);

          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          
          processQueue(null, newAccess);
          isRefreshing = false;

          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleSessionExpired() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Custom event to notify components of authentication termination
  window.dispatchEvent(new Event('auth-logout'));
}

export default api;
