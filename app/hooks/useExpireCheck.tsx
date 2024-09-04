// utils/messageUtils.ts
import { message } from "antd";
import React from "react";
export function useCheckCookieExpiration() {
	// use messageapi
	const [messageApi, contextHolder] = message.useMessage();

	React.useEffect(() => {
		const cookie = document.cookie;
		const expires = cookie
			.split(";")
			.find((c) => c.trim().startsWith("expire_time="))
			?.split("=")[1];

		if (!expires) return;

		const expiresTimeStamp = new Date(expires).getTime();
		const currentTimeStamp = Date.now();

		if (expiresTimeStamp < currentTimeStamp) {
			messageApi.error("会话已过期，请重新登录");
		} else {
			console.log("expiresTimeStamp", expiresTimeStamp);
			console.log("currentTimeStamp", currentTimeStamp);
			messageApi.open({
				type: "success",
				content: "登录成功",
				duration: 2,
			});
		}
	}, [messageApi]);

	return <>{contextHolder}</>;
}
