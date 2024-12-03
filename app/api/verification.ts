import { cache } from "./cache";
import { ModelProvider } from "../constant";

interface TokenPayload {
	user_id: string;
	username: string;
	exp?: number;
}

interface VerificationResponse {
	isValid: boolean;
	user_id?: string;
	username?: string;
	error?: string;
}

function decodeBase64Url(str: string): string {
	// 替换 URL 安全的 base64 字符
	const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	// 添加填充
	const pad = base64.length % 4;
	const padded = pad ? base64 + "=".repeat(4 - pad) : base64;

	// 解码
	try {
		return atob(padded);
	} catch {
		throw new Error("Invalid base64 string");
	}
}

function parseJWT(token: string): TokenPayload | null {
	try {
		const [, payloadBase64] = token.split(".");
		if (!payloadBase64) return null;

		const payloadJson = decodeBase64Url(payloadBase64);
		return JSON.parse(payloadJson);
	} catch {
		return null;
	}
}

export async function verifyAccessToken(
	token: string,
): Promise<VerificationResponse> {
	try {
		// 1. 检查缓存
		const cachedResult = cache.get<VerificationResponse>(token);
		if (cachedResult) {
			return cachedResult;
		}

		// 2. 解析JWT
		const decoded = parseJWT(token);
		console.log("decoded", decoded);
		if (!decoded) {
			return { isValid: false, error: "Invalid token format" };
		}

		// 3. 检查是否过期
		if (decoded.exp && decoded.exp < Date.now() / 1000) {
			return { isValid: false, error: "Token expired" };
		}

		const result: VerificationResponse = {
			isValid: true,
			user_id: decoded.user_id,
			username: decoded.username,
		};

		// 4. 缓存结果
		cache.set(token, result, 60 * 60 * 24); // 缓存24小时

		return result;
	} catch (error) {
		return {
			isValid: false,
			error: error instanceof Error ? error.message : "Invalid token",
		};
	}
}

// 检查用户对特定模型的访问权限
export async function verifyUserPermissions(
	membershipLevel: string,
	modelProvider: ModelProvider,
): Promise<boolean> {
	// 根据会员等级和模型类型判断权限
	// 这里可以根据你的业务逻辑来实现具体的权限判断
	return true;
}

// 获取cookie中的token
export function getTokenFromCookie(): string | null {
	if (typeof document === "undefined") return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; access_token=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift() || null;
	}
	return null;
}
