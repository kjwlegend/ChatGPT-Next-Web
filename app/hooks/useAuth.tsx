"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { useChatStore } from "../store";

interface LoginParams {
	username: string;
	password: string;
}

interface BalanceType {
	balance_type: string;
	balance_sub_type: string;
	current_balance: number;
}

export default function useAuth() {
	const [isLoading, setIsLoading] = useState(false);

	const authStore = useAuthStore();
	const userStore = useUserStore();
	const chatStore = useChatStore();

	const handleMembershipLevel = (level: string): string => {
		switch (level) {
			case "1":
				return "普通会员";
			case "2":
				return "黄金会员";
			case "3":
				return "白金会员";
			case "4":
				return "钻石会员";
			default:
				return "普通会员";
		}
	};

	const handleMembershipExpiryDate = (date: string | null): string => {
		if (!date) {
			return "不过期";
		}
		return date.slice(0, 10);
	};
	const updateUserBalance = (user: User) => {
		// 获取 User 对象中的 user_balance 进行重构，并输出新的 user_balance

		const getBalance = (balanceObj: BalanceType) => {
			// 解构 balanceObj 中的 balance_type 和 balance_sub_type
			const { balance_type, balance_sub_type, current_balance } = balanceObj;

			// 拼接 balance_type 和 balance_sub_type 作为 key，采用 current_balance 作为 value
			return {
				[`${balance_sub_type.toLowerCase()}_${balance_type.toLowerCase()}_balance`]:
					current_balance,
			};
		};

		// 假设 latest_balance 是一个数组，包含多个 BalanceType 对象
		const balanceObjects = user.latest_balance as [BalanceType];
		// 使用 reduce 来构建新的余额对象
		const newBalance = balanceObjects.reduce((acc, element) => {
			const balanceEntry = getBalance(element);
			return { ...acc, ...balanceEntry }; // 合并当前余额到累加器中
		}, {});

		// 输出新的 user_balance
		console.log(newBalance);

		return newBalance; // 如果需要返回新的余额对象，可以这样做
	};

	const updateUserStore = (user: User) => {
		const balance = updateUserBalance(user);
		const updatedUser = {
			...user,
			membership_level: handleMembershipLevel(user.membership_level),
			membership_expiry_date: handleMembershipExpiryDate(
				user.membership_expiry_date,
			),
			user_balance: {
				...user.user_balance,
				...balance,
			},
		};
		// console.log(updatedUser);

		userStore.setUser(updatedUser);
	};

	const loginHook = async (params: LoginParams): Promise<void> => {
		setIsLoading(true);
		try {
			const user = await authStore.login(params);

			if (user) {
				updateUserStore(user);
			}
		} catch (error) {
			console.error("登录失败:", error);
			throw new Error("用户名或密码错误");
		} finally {
			setIsLoading(false);
		}
	};

	const updateUserInfo = async (id: number): Promise<void | Error> => {
		// TODO
		// 这里的方法还需要重做主
		// 目的是刷新信息
		try {
			const user = (await authStore.updateUserInfo(id)) as User | Error;

			console.log(user, "hook debug");
			if (user instanceof Error) {
				logoutHook();
				return;
			}

			if (user) {
				updateUserStore(user);
			}
		} catch (error) {
			console.error("更新用户信息失败:", error);
			throw error;
		}
	};

	const logoutHook = async () => {
		await authStore.logout();
		userStore.clearUser();
		chatStore.clearChatData();
	};

	return {
		user: authStore.user,
		loginHook,
		logoutHook,
		updateUserInfo,
		isLoading,
		isAuthenticated: authStore.isAuthenticated,
		accessToken: authStore.getAccessToken(),
		refreshToken: authStore.getRefreshToken(),
	};
}
