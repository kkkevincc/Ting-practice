import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// 添加请求拦截器，自动添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器，处理错误（不再强制登录）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 不再强制跳转登录页面
    return Promise.reject(error);
  }
);

export default api;
