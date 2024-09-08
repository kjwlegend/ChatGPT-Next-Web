import { message } from "antd";
import { useEffect } from "react";

export function useCheckCookieExpiration() {
	useEffect(() => {
		const checkExpiration = () => {
			const cookie = document.cookie;
			const expires = cookie
				.split(";")
				.find((c) => c.trim().startsWith("expire_time="))
				?.split("=")[1];

			if (!expires) return;

			const expiresTimeStamp = new Date(expires).getTime();
			const currentTimeStamp = Date.now();

			if (expiresTimeStamp < currentTimeStamp) {
				message.error("会话已过期，请重新登录");
			} else {
				const expireTime = new Date(expires).toLocaleString();
				message.success(`您的登录过期时间为: ${expireTime}`);
			}
		};

		// 立即检查一次
		checkExpiration();

		// 可选：设置定期检查
		const intervalId = setInterval(checkExpiration, 3600000); // 每1小时检查一次

		return () => clearInterval(intervalId); // 清理函数
	}, []);
}
