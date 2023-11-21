import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth";
import { useRouter } from "next/navigation";
import { server_url } from "../constant";

const service: AxiosInstance = axios.create({
  baseURL: server_url + "/api",
  timeout: 15000,
});

function request(config: AxiosRequestConfig) {
  return service(config);
}

service.interceptors.request.use(
  (config) => {
    // 获取token
    const accessToken = useAuthStore.getState().accessToken;
    // console.log("accessToken", accessToken);
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

    const authStore = useAuthStore();
    const router = useRouter();

    // 根据返回的数据中的 "code" 字段或响应的状态码来判断令牌是否过期
    if ((responseData && responseData.code === 401) || responseStatus === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = authStore.refreshToken;
          const response = await service.post("/api/gpt/token/refresh/", {
            refreshToken,
          });

          const newAccessToken = response.data.accessToken;

          useAuthStore.getState().login(
            newAccessToken || "", // 添加空字符串作为默认值
            refreshToken || "", // 添加空字符串作为默认值
          );

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 重新发送原始请求
          return service(originalRequest);
        } catch (error) {
          // 处理刷新令牌失败的情况，例如跳转到登录页面
          router.push("/auth");

          throw new Error("刷新令牌失败，请重新登录");
        }
      } else {
        // 处理已经重试过的请求的情况，例如跳转到登录页面
        router.push("/auth");
        throw new Error("令牌已过期，请重新登录");
      }
    }

    return Promise.reject(error);
  },
);

request.get =  function (url: string, config?: AxiosRequestConfig) {
  return  service.get(url, config);
};

request.post =  function (url: string, data?: any, config?: AxiosRequestConfig) {
  return  service.post(url, data, config);
};

export default request;
