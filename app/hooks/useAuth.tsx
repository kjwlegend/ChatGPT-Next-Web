import { useState, useEffect } from "react";
import { loginAPI } from "../api/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";
import { Result } from "antd";
import { getUserInfo } from "../api/backend/user";
import { ChatSessionData, getChatSession } from "../api/backend/chat";
import { updateChatSessions } from "../services/chatService";
import { useChatStore } from "../store/chat";

interface LoginParams {
	username: string;
	password: string;
}
import { ChatSession } from "../store/chat";
import { createEmptyMask } from "../store/mask";

export default function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [expirationDate, setExpirationDate] = useState<Date>(new Date());

	const authStore = useAuthStore();
	const userStore = useUserStore();
	const chatStore = useChatStore();

	useEffect(() => {
		if (user) {
			const fetchAndStoreSessions = async () => {
				const param: ChatSessionData = {
					user: user.id,
					limit: 35,
				};
				try {
					const chatSessionList = await getChatSession(param);
					console.log("chatSessionList", chatSessionList.data);
					// 直接使用 chatStore 的方法更新 sessions
					chatSessionList.data.forEach((sessionData: any) => {
						// 检查chatstore.sessions中是否已经存在该会话
						const exists = chatStore.sessions.some(
							(s) => s.id === sessionData.session_id,
						);
						// console.log("exists: ", exists, "sessionData: ", sessionData);

						// 如果不存在，则创建一个新的ChatSession对象并添加到chatstore.sessions中
						if (!exists) {
							const newSession: ChatSession = {
								id: sessionData.session_id,
								topic: sessionData.session_topic || "", // 如果session_topic为null，则使用空字符串
								memoryPrompt: "", // 根据实际情况填充
								messages: [], // 根据实际情况填充
								stat: {
									tokenCount: 0,
									wordCount: 0,
									charCount: 0,
								}, // 根据实际情况填充
								lastUpdate: Date.parse(sessionData.last_updated),
								lastSummarizeIndex: 0, // 根据实际情况填充
								clearContextIndex: undefined, // 根据实际情况填充
								mask: createEmptyMask(), // 根据实际情况填充
								responseStatus: undefined, // 根据实际情况填充
								isworkflow: undefined, // 根据实际情况填充
								mjConfig: { size: "", quality: "", style: "", model: "" },
							};
							chatStore.addSession(newSession);
						}
					});
				} catch (error) {
					console.log("get chatSession list error", error);
				}
			};

			fetchAndStoreSessions();
		}
	}, [user, chatStore]);

	const loginHook = async (params: LoginParams): Promise<void> => {
		try {
			setIsLoading(true);

			const result = await loginAPI(params);
			// cookie

			console.log("当前:", expirationDate);
			expirationDate.setTime(expirationDate.getTime() + 48 * 60 * 60 * 1000); // 当前时间的 48 小时后
			console.log("48小时后:", expirationDate);
			setExpirationDate(expirationDate);
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
			// cookie ends

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
