import axios from "axios";
// 参数接口
export interface ImagineParams {
	base64Array?: Record<string, unknown>[];
	notifyHook?: string;
	prompt: string;
	state?: string;
}

// 响应接口
export interface ImagineRes {
	code: number;
	description: string;
	properties: Record<string, unknown>;
	result: string;
}

/**
 * 提交Imagine任务
 * @param {object} params imagineDTO
 * @param {array} params.base64Array 垫图base64数组
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.prompt 提示词
 * @param {string} params.state 自定义参数
 * @returns
 */
export function imagine(params: ImagineParams): Promise<ImagineRes> {
	// 注意：这里的 URL 应该指向你的 Next.js API 路由+
	console.log("imagineParams", params);
	return axios
		.post("/api/midjourney/mj/submit/imagine", params, {
			// headers: {
			// 	"Content-Type": "application/json",
			// },
		})
		.then((response) => response.data);
}
