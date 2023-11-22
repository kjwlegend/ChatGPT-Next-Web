import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth";
import { server_url } from "../constant";

const service: AxiosInstance = axios.create({
  baseURL: server_url + "/api",
  timeout: 15000,
});

async function refreshTokenAndRetryRequest(error, originalRequest) {
  const refreshToken = useAuthStore.getState().getRefreshToken();
  try {
    const response = await service.post("/api/gpt/token/refresh/", {
      refreshToken,
    });

    const newAccessToken = response.data.accessToken;
    useAuthStore.getState().login(newAccessToken, refreshToken); // 更新状态

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return service(originalRequest); // 重新发送原始请求
  } catch (refreshError) {
    // 刷新令牌失败的处理逻辑
    throw new Error("刷新令牌失败，请重新登录");
  }
}

service.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().getAccessToken(); // 获取 token 的新方式
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const responseData = error.response.data;
    const responseStatus = error.response.status;

    if ((responseData && responseData.code === 401) || responseStatus === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        return refreshTokenAndRetryRequest(error, originalRequest);
      } else {
        // 令牌已过期的处理逻辑
        throw new Error("令牌已过期，请重新登录");
      }
    }

    return Promise.reject(error);
  },
);

async function request(config: AxiosRequestConfig) {
  return service(config);
}

request.get = async function (url: string, config?: AxiosRequestConfig) {
  return service.get(url, config);
};

request.post = async function (url: string, data?: any, config?: AxiosRequestConfig) {
  return service.post(url, data, config);
};

export default request;
