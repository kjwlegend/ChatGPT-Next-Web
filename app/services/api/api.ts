import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// import { useAuthStore } from "../store/auth";

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

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL + "/api/xiaoguang/";

if (!baseURL) {
	throw new Error(
		"API base URL is not defined. Please set NEXT_PUBLIC_SERVER_URL in your .env.local file.",
	);
}

const service: AxiosInstance = axios.create({
	baseURL,
	timeout: 15000,
});

function getCookie(name: string): string | null {
	const value = `; ${document.cookie}`; // 在 cookie 字符串前加分号以便于分割
	const parts = value.split(`; ${name}=`); // 分割字符串以获取特定 cookie

	// 如果 parts 的长度大于 1，说明找到了指定的 cookie
	if (parts.length > 1) {
		// 返回 cookie 的值，并去除可能存在的前后空格
		return parts.pop()?.split(";")[0].trim() || null;
	}
	return null; // 如果没有找到，返回 null
}
async function refreshTokenAndRetryRequest(error: any, originalRequest: any) {
	// get refreshToekn from cookie
	const refreshToken = getCookie("refresh_token");

	if (!refreshToken) {
		return Promise.reject(error);
	}
	// 刷新 token

	try {
		const response = await service.post("/gpt/token/refresh/", {
			refreshToken,
		});

		const newAccessToken = response.data.accessToken;

		originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
		return service(originalRequest); // 重新发送原始请求
	} catch (refreshError) {
		// 刷新令牌失败的处理逻辑
		window.location.href = "/auth"; // 重定向到登录页面
		throw new Error("刷新令牌失败，请重新登录");
	}
}

service.interceptors.request.use(
	(config) => {
		const accessToken = getCookie("access_token");
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		config.withCredentials = true;
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

request.put = async function (
	url: string,
	data?: any,
	config?: AxiosRequestConfig,
) {
	return service.put(url, data, config);
};

export default request;

export const handleError = (error: any) => {
	console.error(error);
	return error.response ? error.response.data : { error: "Network Error" };
};

export const api = (appurl: string, endpoint: string) => {
	return async (params?: any, id?: string | number) => {
		const url = id
			? `/${appurl}${endpoint.replace(new RegExp(`{?\\:id}?`, "g"), encodeURIComponent(id))}/`
			: `/${appurl}${endpoint}/`;
		try {
			const response = await request.post(url, params);
			return response.data;
		} catch (error) {
			return handleError(error);
		}
	};
};

export const apiGet = (appurl: string, endpoint: string) => {
	return async (params?: any, id?: string | number) => {
		const url = id
			? `/${appurl}${endpoint.replace(new RegExp(`{?\\:id}?`, "g"), encodeURIComponent(id))}/`
			: `/${appurl}${endpoint}/`;
		try {
			const response = await request.get(url, { params });
			return response.data;
		} catch (error) {
			return handleError(error);
		}
	};
};

export const apiPut = (appurl: string, endpoint: string) => {
	return async (params: any, id?: string | number) => {
		const url = id
			? `/${appurl}${endpoint.replace(new RegExp(`{?\\:id}?`, "g"), encodeURIComponent(id))}/`
			: `/${appurl}${endpoint}/`;
		try {
			const response = await request.put(url, params);
			return response.data;
		} catch (error) {
			return handleError(error);
		}
	};
};
