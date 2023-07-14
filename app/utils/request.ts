// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

function request(config: AxiosRequestConfig) {
  return service(config);
}

request.get = function (url: string, config?: AxiosRequestConfig) {
  return service.get(url, config);
};

request.post = function (url: string, data?: any, config?: AxiosRequestConfig) {
  return service.post(url, data, config);
};

export default request;
