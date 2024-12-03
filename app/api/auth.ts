import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider } from "../constant";
import request from "@/app/utils/request";
import { useAuthStore } from "../store/auth";
import { use } from "react";
import { useUserStore } from "../store";
import { server_url } from "../constant";
import { verifyAccessToken, verifyUserPermissions } from "./verification";

function getIP(req: NextRequest) {
	// Use x-forwarded-for header as the source of the IP address
	let ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
	const forwardedFor = req.headers.get("x-forwarded-for");

	if (!ip && forwardedFor) {
		ip = forwardedFor.split(",").at(0) ?? "";
	}

	return ip;
}

function parseApiKey(bearToken: string) {
	const token = bearToken.trim().replaceAll("Bearer ", "").trim();
	const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

	return {
		accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
		apiKey: isOpenAiKey ? token : "",
	};
}

export async function auth(req: NextRequest) {
	// 1. 获取token
	const accessToken = req.cookies.get("access_token")?.value ?? "";

	// 2. 验证token
	const verification = await verifyAccessToken(accessToken);
	console.log("verification", verification);
	if (!verification.isValid) {
		return {
			error: true,
			msg: "请重新登录",
			status: 401,
		};
	}

	const serverConfig = getServerSideConfig();
	const serverApiKey = serverConfig.apiKey;
	console.log("serverApiKey", serverApiKey);

	if (serverApiKey) {
		// 设置请求头中的API Key
		const authHeader = `Bearer ${serverApiKey}`;
		req.headers.set("Authorization", authHeader);
	} else {
		return {
			error: true,
			msg: "服务配置错误",
			status: 500,
		};
	}
	return {
		error: false,
		user_id: verification.user_id,
		username: verification.username,
	};
}

// 辅助函数
function formatAuthHeader(
	apiKey: string,
	modelProvider?: ModelProvider,
	config?: any,
): string {
	if (modelProvider === ModelProvider.GeminiPro) {
		return apiKey;
	}
	return `${config?.isAzure ? "" : "Bearer "}${apiKey}`;
}

// Path: app\api\auth.ts
// @JINGWEI KONG Customized
