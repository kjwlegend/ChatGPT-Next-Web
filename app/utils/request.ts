// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/app/store/auth";

const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

function request(config: AxiosRequestConfig) {
  return service(config);
}

service.interceptors.request.use(
  (config) => {
    // 获取token
    const token = useAuthStore.getState().user.token;
    if (token) {
      config.headers!.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.get = function (url: string, config?: AxiosRequestConfig) {
  return service.get(url, config);
};

request.post = function (url: string, data?: any, config?: AxiosRequestConfig) {
  return service.post(url, data, config);
};

export default request;
