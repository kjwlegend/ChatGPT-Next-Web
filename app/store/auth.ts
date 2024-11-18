import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, logout } from "../services/api/auth";
import { getUserInfo } from "../api/backend/user";

import { User } from "./user";
import { getUser } from "../services/api/user";

interface LoginParams {
	username: string;
	password: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	login: (params: LoginParams) => Promise<User>;
	logout: () => Promise<void>;
	getAccessToken: () => string | null;
	getRefreshToken: () => string | null;
	updateToken: (token: string) => void;
	updateUserInfo: (id: string | number) => Promise<void | Error>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			isAuthenticated: false,
			accessToken: null,
			refreshToken: null,
			user: null,
			login: async (params: LoginParams) => {
				try {
					const result = await login(params);

					const newExpirationDate = new Date();
					newExpirationDate.setTime(
						newExpirationDate.getTime() + 48 * 60 * 60 * 1000,
					); // 当前时间的 48 小时后

					const formattedExpireTime = newExpirationDate.toLocaleString(
						"zh-CN",
						{
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						},
					);

					document.cookie = `authenticated=true; expires=${newExpirationDate.toUTCString()}; path=/`;
					document.cookie = `user_id=${result.user.username}; expires=${newExpirationDate.toUTCString()}; path=/`;
					//  add token to cookie

					document.cookie = `access_token=${result.access}; expires=${newExpirationDate.toUTCString()}; path=/`;
					document.cookie = `refresh_token=${result.refresh}; expires=${newExpirationDate.toUTCString()}; path=/`;
					document.cookie = `expire_time=${formattedExpireTime}; path=/`;
					set({
						isAuthenticated: true,
						accessToken: result.access,
						refreshToken: result.refresh,
						user: result.user,
					});
					return result.user;
				} catch (error) {
					console.error("登录失败:", error);
					throw new Error("用户名或密码错误");
				}
			},
			logout: async () => {
				await logout();
				set({
					isAuthenticated: false,
					accessToken: null,
					refreshToken: null,
					user: null,
				});
				document.cookie =
					"authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
				document.cookie =
					"user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

				document.cookie =
					"access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
				document.cookie =
					"refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			},
			getAccessToken: () => {
				return get().accessToken;
			},
			getRefreshToken: () => {
				return get().refreshToken;
			},
			updateToken: (token: string) => {
				set({ accessToken: token });
			},
			updateUserInfo: async (id: string | number) => {
				try {
					const user = await getUser({}, id);
					if (user.code === 401) {
						await get().logout();
						return new Error("登录过期，请重新登录");
					}
					set({ user });
					return user;
				} catch (error) {
					console.error("更新用户信息失败:", error);
					throw error;
				}
			},
		}),
		{
			name: "auth-store",
			version: 1,
		},
	),
);
type InviteCodeStore = {
	inviteCode: string | null;
	setInviteCode: (code: string | null) => void;
};

export const useInviteCodeStore = create<InviteCodeStore>()(
	persist(
		(set, get) => ({
			inviteCode: null,
			setInviteCode: (code) => set({ inviteCode: code }),
		}),
		{
			name: "invite-code-store",
			version: 1,
		},
	),
);
