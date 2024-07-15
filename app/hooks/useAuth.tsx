"use client";
import { useState, useEffect } from "react";
import { loginAPI } from "../services/auth";
import { useAuthStore } from "../store/auth";
import { useUserStore, User } from "../store/user";
import { logoutAPI } from "../api/auth";
import { Result } from "antd";
import { getUserInfo } from "../api/backend/user";
import { ChatSessionData, getChatSession } from "../api/backend/chat";
import { UpdateChatSessions } from "../services/chatService";
import { useChatStore } from "../store/chat";

import { createEmptyMask } from "../store/mask";

interface LoginParams {
	username: string;
	password: string;
}

export default function useAuth() {
	const [isLoading, setIsLoading] = useState(false);

	const authStore = useAuthStore();
	const userStore = useUserStore();

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

	const loginHook = async (params: LoginParams): Promise<void> => {
		setIsLoading(true);
		try {
			await authStore.login(params);

			const user = authStore.user;
			if (user) {
				user.membership_level = handleMembershipLevel(user.membership_level);
				user.membership_expiry_date = handleMembershipExpiryDate(
					user.membership_expiry_date,
				);
				userStore.setUser(user);
			}
		} catch (error) {
			console.error("登录失败:", error);
			throw new Error("用户名或密码错误");
		} finally {
			setIsLoading(false);
		}
	};

	const updateUserInfo = async (id: number): Promise<void | Error> => {
		try {
			const user = (await authStore.updateUserInfo(id)) as User | Error;

			if (user instanceof Error) {
				logoutHook();
				return user;
			}

			if (user) {
				user.membership_level = handleMembershipLevel(user.membership_level);
				user.membership_expiry_date = handleMembershipExpiryDate(
					user.membership_expiry_date,
				);
				userStore.updateUser(user);
			}
		} catch (error) {
			console.error("更新用户信息失败:", error);
			throw error;
		}
	};

	const logoutHook = async () => {
		await authStore.logout();
		userStore.clearUser();
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
