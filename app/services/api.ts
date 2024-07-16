import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth";
import { Stats } from "fs";

type AppMappingType = {
	[key: string]: string;
};

export const AppMapping: AppMappingType = {
	user: "user-center",
	llm: "llm",
	ecommerce: "ecommerce",
	stats: "stats",
	default: "",
};

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL + "/xiaoguang/";

if (!baseURL) {
	throw new Error(
		"API base URL is not defined. Please set NEXT_PUBLIC_SERVER_URL in your .env.local file.",
	);
}

const service: AxiosInstance = axios.create({
	baseURL,
	timeout: 15000,
});

async function refreshTokenAndRetryRequest(error: any, originalRequest: any) {
	const refreshToken = useAuthStore.getState().getRefreshToken();
	try {
		const response = await service.post("/gpt/token/refresh/", {
			refreshToken,
		});

		const newAccessToken = response.data.accessToken;

		originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
		return service(originalRequest); // 重新发送原始请求
	} catch (refreshError) {
		// 刷新令牌失败的处理逻辑
		useAuthStore.getState().logout(); // 清除过期的 token
		window.location.href = "/auth/login"; // 重定向到登录页面
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
		const responseStatus = error.response ? error.response.status : null;

		if (responseStatus === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			return refreshTokenAndRetryRequest(error, originalRequest);
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

request.post = async function (
	url: string,
	data?: any,
	config?: AxiosRequestConfig,
) {
	return service.post(url, data, config);
};

export default request;

export const handleError = (error: any) => {
	console.error(error);
	return error.response ? error.response.data : { error: "Network Error" };
};

export const api = (appurl: string, endpoint: string) => {
	return async (params?: any, id?: string) => {
		const url = id
			? `/${appurl}${endpoint.replace(new RegExp(`{?\\:id}?`, "g"), encodeURIComponent(id))}`
			: `/${appurl}${endpoint}`;
		try {
			const response = await request.post(`/${appurl}${endpoint}`, params);
			return response.data;
		} catch (error) {
			return handleError(error);
		}
	};
};

export const apiGet = (appurl: string, endpoint: string) => {
	return async (params?: any, id?: string) => {
		const url = id
			? `/${appurl}${endpoint.replace(new RegExp(`{?\\:id}?`, "g"), encodeURIComponent(id))}`
			: `/${appurl}${endpoint}`;
		try {
			const response = await request.get(url, { params });
			return response.data;
		} catch (error) {
			return handleError(error);
		}
	};
};
