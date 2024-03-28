"use client";
import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";
import { Result } from "antd";
import { getUserInfo } from "../api/backend/user";
import { ChatSessionData, getChatSession } from "../api/backend/chat";
import { UpdateChatSessions } from "../services/chatService";
import { useChatStore } from "../store/chat";

interface LoginParams {
	username: string;
	password: string;
}
import { ChatSession } from "../store/chat";
import { createEmptyMask } from "../store/mask";
import { error } from "console";

// function clearAllData() {
// 	const chatStore = useChatStore();
// 	chatStore.clearAllData();
// }

export default function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [expirationDate, setExpirationDate] = useState<Date>(new Date());

	const authStore = useAuthStore();
	const userStore = useUserStore();

	const loginHook = async (params: LoginParams): Promise<void> => {
		try {
			setIsLoading(true);

			const result = await loginAPI(params);
			// cookie

			console.log("当前:", expirationDate);
			expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000); // 当前时间的 24 小时后
			console.log("24小时后cookie过期:", expirationDate);
			setExpirationDate(expirationDate);
			document.cookie = `authenticated=true;`;
			document.cookie = `user_id=${result.data.user.id}`;
			document.cookie = `expires=${expirationDate.toUTCString()};`;

			const authInfo = {
				accessToken: result.data.access,
				refreshToken: result.data.refresh,
				user: result.data.user,
			};

			if (authInfo.user) {
				// 处理会员类型 , 如果是 normal 则为普通会员, 如果是 monthly 黄金会员, quarterly 为白金会员, yearly 为钻石会员

				// switch 语法

				switch (authInfo.user.member_type) {
					case "normal":
						authInfo.user.member_type = "普通会员";
						break;
					case "monthly":
						authInfo.user.member_type = "黄金会员";
						break;
					case "quarterly":
						authInfo.user.member_type = "白金会员";
						break;
					case "halfyearly":
						authInfo.user.member_type = "钻石会员";
						break;
					default:
						authInfo.user.member_type = "普通会员";
				}
				// 存在过期时间则处理, 否则显示不过期
				if (!authInfo.user.member_expire_date) {
					authInfo.user.member_expire_date = "不过期";
				} else {
					// 处理 member_expire_date 会员过期时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
					authInfo.user.member_expire_date =
						authInfo.user.member_expire_date.slice(0, 10);
				}
				// 处理重置时间, 如果没有重置时间则显示不重置
				if (!authInfo.user.last_refresh_date) {
					authInfo.user.last_refresh_date = "不重置";
				} else {
					// 处理 last_refresh_date 会员重置时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
					authInfo.user.last_refresh_date =
						authInfo.user.last_refresh_date.slice(0, 10);
					// 如果有重置时间,则在获取到的时间上+30天
					const last_refresh_date = new Date(authInfo.user.last_refresh_date);
					last_refresh_date.setDate(last_refresh_date.getDate() + 30);
					authInfo.user.last_refresh_date = last_refresh_date
						.toISOString()
						.slice(0, 10);
				}
				authStore.login(authInfo.accessToken, authInfo.refreshToken);
				userStore.setUser(authInfo.user);
				setUser(authInfo.user);
			}
			console.log("cookie", document.cookie);

			setIsLoading(false);
			return result;
		} catch (error) {
			error = "用户名或密码错误";
			throw error;
		}
	};
	const updateUserInfo = async (id: number): Promise<void | Error> => {
		const user = await getUserInfo(id);

		if (user.code == 401) {
			logoutHook();
			return new Error("登录过期，请重新登录");
		}

		// 处理会员类型 , 如果是 normal 则为普通会员, 如果是 monthly 黄金会员, quarterly 为白金会员, yearly 为钻石会员

		// switch 语法

		switch (user.member_type) {
			case "normal":
				user.member_type = "普通会员";
				break;
			case "monthly":
				user.member_type = "黄金会员";
				break;
			case "quarterly":
				user.member_type = "白金会员";
				break;
			case "halfyearly":
				user.member_type = "钻石会员";
				break;
			default:
				user.member_type = "普通会员";
		}
		// 存在过期时间则处理, 否则显示不过期
		if (!user.member_expire_date) {
			user.member_expire_date = "不过期";
		} else {
			// 处理 member_expire_date 会员过期时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
			user.member_expire_date = user.member_expire_date.slice(0, 10);
		}

		// 处理重置时间, 如果没有重置时间则显示不重置
		if (!user.last_refresh_date) {
			user.last_refresh_date = "不重置";
		} else {
			// 处理 last_refresh_date 会员重置时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
			user.last_refresh_date = user.last_refresh_date.slice(0, 10);
			// 如果有重置时间,则在获取到的时间上+30天
			const last_refresh_date = new Date(user.last_refresh_date);
			last_refresh_date.setDate(last_refresh_date.getDate() + 30);
			user.last_refresh_date = last_refresh_date.toISOString().slice(0, 10);
		}
		console.log("user", user);
		userStore.updateUser(user);
	};

	const logoutHook = async () => {
		await logoutAPI();
		//clear cookie

		setTimeout(() => {
			authStore.logout();
			userStore.clearUser();
		}, 1000);

		// clearAllData();
	};

	return {
		user,
		loginHook,
		logoutHook,
		updateUserInfo,
		isLoading,
	};
}
