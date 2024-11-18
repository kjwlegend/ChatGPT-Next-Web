import { useEffect } from "react";
import { message } from "antd";
import { useAuthStore } from "@/app/store/auth";
import { refreshToken } from "@/app/services/api/user";
import useAuth from "@/app/hooks/useAuth";

export const useTokenRefresh = () => {
	const authStore = useAuthStore();
	const { logoutHook } = useAuth();
	const isAuthenticated = authStore.isAuthenticated;

	useEffect(() => {
		if (!isAuthenticated) return;

		const refreshTokenAndUpdate = async () => {
			try {
				// 使用函数方式获取最新的 token，而不是依赖闭包中的值
				const currentRefreshToken = authStore.getRefreshToken();
				const response = await refreshToken({
					refresh: currentRefreshToken,
				});
				if (response.access) {
					authStore.updateToken(response.access);
					message.success("会话已刷新");
				} else {
					logoutHook();
					message.error("会话已过期，请重新登录");
				}
			} catch (error) {
				logoutHook();
				message.error("会话已过期，请重新登录");
			}
		};

		const intervalId = setInterval(refreshTokenAndUpdate, 45 * 60 * 1000);
		refreshTokenAndUpdate(); // Initial refresh

		return () => clearInterval(intervalId);
	}, []); // 只保留真正需要的依赖
};
