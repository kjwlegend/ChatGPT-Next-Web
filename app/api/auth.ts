import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider } from "../constant";
import request from "@/app/utils/request";
import { useAuthStore } from "../store/auth";
import { use } from "react";
import { useUserStore } from "../store";
import { getUserInfo } from "./user";
import { server_url } from "../constant";
function getIP(req: NextRequest) {
	let ip = req.ip ?? req.headers.get("x-real-ip");
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

export function auth(req: NextRequest, modelProvider?: ModelProvider) {
	const authToken = req.headers.get("Authorization") ?? "";
	const isAuthenticated = req.cookies.get("authenticated")?.value === "true";

	console.log("[Auth] isAuthenticated", isAuthenticated);

	// check if it is openai api key or user token
	let { accessCode, apiKey } = parseApiKey(authToken);

	if (modelProvider === ModelProvider.GeminiPro) {
		const googleAuthToken = req.headers.get("x-goog-api-key") ?? "";
		apiKey = googleAuthToken.trim().replaceAll("Bearer ", "").trim();
	}

	const hashedCode = md5.hash(accessCode ?? "").trim();

	const serverConfig = getServerSideConfig();
	console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
	console.log("[Auth] got access code:", accessCode);
	console.log("[Auth] hashed access code:", hashedCode);
	console.log("[Auth] got api key:", apiKey);
	console.log("[User IP] ", getIP(req));
	console.log("Auth", isAuthenticated);
	console.log("[Time] ", new Date().toLocaleString());

	if (isAuthenticated === false) {
		return {
			error: true,
			msg: !accessCode
				? "未登录或登录已过期, 请重新登录"
				: "未登录或授权码为空, 如清除了cookie, 请重新登录",
		};
	}

	// if user does not provide an api key, inject system api key
	if (isAuthenticated === true) {
		const serverApiKey =
			modelProvider === ModelProvider.GeminiPro
				? serverConfig.googleApiKey
				: serverConfig.isAzure
				? serverConfig.azureApiKey
				: serverConfig.apiKey;

		if (serverApiKey) {
			console.log("[Auth] use system api key");
			req.headers.set(
				"Authorization",
				`${serverConfig.isAzure ? "" : "Bearer "}${serverApiKey}`,
			);
		} else {
			console.log("[Auth] admin did not provide an api key");
		}
	} else {
		console.log("[Auth] use user api key");
	}

	return {
		error: false,
	};
}

// Path: app\api\auth.ts
// @JINGWEI KONG Customized

export interface RegisterParams {
	username: string;
	password: string;
	nickname?: string;
	gender?: number;
	email: string;
	invite_code?: string;
}

export interface RegisterResult {
	token: string;
	status: string;
	data: object;
}

export async function register(params: any): Promise<any> {
	return request
		.post("/gpt/register/", params)
		.then((res) => res.data)
		.catch((err) => {
			// console.log("error", err);
			return err.response.data;
		});
}

interface LoginParams {
	username: string;
	password: string;
}

export async function loginAPI(params: LoginParams) {
	return request({
		url: "/gpt/login/",
		method: "post",
		data: params,
	})
		.then((res) => {
			return res.data;
		})
		.catch((err) => {
			// console.log(err);
			return err.response.data;
		});
}

export async function logoutAPI() {
	return request({
		url: "/gpt/logout/",
		method: "post",
	})
		.then((res) => {
			// logout 后清除所有cookie
			document.cookie =
				"authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			document.cookie =
				"user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			document.cookie =
				"member_type=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			document.cookie =
				"member_expire_date=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

			return res.data;
		})
		.catch((err) => {
			// console.log(err);
			return err.response;
		});
}
