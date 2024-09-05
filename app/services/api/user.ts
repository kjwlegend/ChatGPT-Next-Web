import { AppMapping, api, apiGet, apiPut } from "./api";

// 定义更新用户信息的参数接口
export interface UpdateUserParams {
	username?: string; // 可选字段
	nickname?: string;
	birthday?: string;
	zodiac?: string;
	interests?: string[];
}

const appnamespace = AppMapping.user;

export const getUser = apiGet(appnamespace, "/users/:id/");
export const updateUser = apiPut(appnamespace, "/users/:id/");
export const getLatestBalance = apiGet(
	appnamespace,
	"/users/:id/latest-balance/",
);
export const getBalanceHistory = apiGet(
	appnamespace,
	"/users/:id/balance-history/",
);

// 新增daily-check-in/ 接口
export const getDailyCheckIn = api(appnamespace, "/daily-check-in/");
