import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";
import { Result } from "antd";
import { getUserInfo } from "../api/user";

interface LoginParams {
	username: string;
	password: string;
}

export default function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const authStore = useAuthStore();
	const userStore = useUserStore();
	useEffect(() => {
		const storedUser = authStore.isAuthenticated ? userStore.user : null;
		setUser(storedUser);
	}, [authStore]);

	const loginHook = async (params: LoginParams): Promise<void> => {
		try {
			setIsLoading(true);

			const result = await loginAPI(params);
			// cookie
			const expirationDate = new Date();
			expirationDate.setTime(expirationDate.getTime() + 48 * 60 * 60 * 1000); // 当前时间的 48 小时后
			document.cookie = `authenticated=true; user_id=${
				result.data.user.id
			}; expires=${expirationDate.toUTCString()}; path=/`;
			document.cookie = `user_id=${
				result.data.user.id
			}; expires=${expirationDate.toUTCString()}; path=/`;
			document.cookie = `member_type=${
				result.data.user.member_type
			}; expires=${expirationDate.toUTCString()}; path=/`;
			document.cookie = `member_expire_date=${
				result.data.user.member_expire_date
			}; expires=${expirationDate.toUTCString()}; path=/`;

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
				if (!authInfo.user.last_refresh_date) 
				{
					authInfo.user.last_refresh_date = "不重置";
				} else {
					// 处理 last_refresh_date 会员重置时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
					authInfo.user.last_refresh_date =
						authInfo.user.last_refresh_date.slice(0, 10);
				// 如果有重置时间,则在获取到的时间上+30天
				const last_refresh_date = new Date(authInfo.user.last_refresh_date);
				last_refresh_date.setDate(last_refresh_date.getDate() + 30);
				authInfo.user.last_refresh_date = last_refresh_date.toISOString().slice(0, 10);

				}

			}

			authStore.login(authInfo.accessToken, authInfo.refreshToken);
			userStore.setUser(authInfo.user);

			setUser(authInfo.user);
			setIsLoading(false);
			return result;
		} catch (error) {
			setIsLoading(false);
			const result = await loginAPI(params);
			console.log(result);

			throw new Error(result.msg);
		}
	};
	const updateUserInfo = async (id: number): Promise<void> => {
		const user = await getUserInfo(id);

		if (user) {
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
			if (!user.last_refresh_date) 
			{
				user.last_refresh_date = "不重置";
			} else {
				// 处理 last_refresh_date 会员重置时间 . 元数据 2023-01-01 00:00:00 . 只保留日期部分
				user.last_refresh_date =
					user.last_refresh_date.slice(0, 10);
			// 如果有重置时间,则在获取到的时间上+30天
			const last_refresh_date = new Date(user.last_refresh_date);
			last_refresh_date.setDate(last_refresh_date.getDate() + 30);
			user.last_refresh_date = last_refresh_date.toISOString().slice(0, 10);

			}
		}

		userStore.updateUser(user);
	};

	const logoutHook = async () => {
		await logoutAPI();
		//clear cookie
		document.cookie = `authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `member_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `member_expire_date=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

		authStore.logout();
		userStore.clearUser();
	};

	return {
		user,
		loginHook,
		logoutHook,
		updateUserInfo,
		isLoading,
	};
}
