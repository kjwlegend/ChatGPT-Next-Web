import axios from "axios";

const request = axios.create({
	baseURL: "/api/midjourney",
	timeout: 10000,
});

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
// 参数接口

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
	return request.post(`/mj/submit/imagine`, params);
}

// 参数接口
export interface DescribeParams {
	base64: string;
	notifyHook?: string;
	state?: string;
}

// 响应接口
export interface DescribeRes {
	code: number;
	description: string;
	properties: Record<string, unknown>;
	result: string;
}

/**
 * 提交Describe任务
 * @param {object} params describeDTO
 * @param {string} params.base64 图片base64
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @returns
 */
export function describe(params: DescribeParams): Promise<DescribeRes> {
	return request.post(`/mj/submit/describe`, params);
}

// 参数接口
export interface ChangeParams {
	action: "UPSCALE" | "VARIATION" | "REROLL";
	index?: number;
	notifyHook?: string;
	state?: string;
	taskId: string;
}

// 响应接口
export interface ChangeRes {
	code: number;
	description: string;
	properties: Record<string, unknown>;
	result: string;
}

/**
 * 绘图变化
 * @param {object} params changeDTO
 * @param {string} params.action UPSCALE(放大); VARIATION(变换); REROLL(重新生成),可用值:UPSCALE,VARIATION,REROLL
 * @param {number} params.index 序号(1~4), action为UPSCALE,VARIATION时必传
 * @param {string} params.notifyHook 回调地址, 为空时使用全局notifyHook
 * @param {string} params.state 自定义参数
 * @param {string} params.taskId 任务ID
 * @returns
 */
export function change(params: ChangeParams): Promise<ChangeRes> {
	return request.post(`/mj/submit/change`, params);
}

// 响应接口
export interface ListRes {
	action: string;
	description: string;
	failReason: string;
	finishTime: number;
	id: string;
	imageUrl: string;
	progress: string;
	prompt: string;
	promptEn: string;
	properties: Record<string, unknown>;
	startTime: number;
	state: string;
	status: string;
	submitTime: number;
}

/**
 * 查询所有任务
 * @returns
 */
export function list(): Promise<ListRes[]> {
	return request.get(`/mj/task/list`);
}

// 响应接口
export interface QueueRes {
	action: string;
	description: string;
	failReason: string;
	finishTime: number;
	id: string;
	imageUrl: string;
	progress: string;
	prompt: string;
	promptEn: string;
	properties: Record<string, unknown>;
	startTime: number;
	state: string;
	status: string;
	submitTime: number;
}

/**
 * 查询任务队列
 * @returns
 */
export function queue(): Promise<QueueRes[]> {
	return request.get(`/mj/task/queue`);
}

// 响应接口
export interface FetchRes {
	action: string;
	description: string;
	failReason: string;
	finishTime: number;
	id: string;
	imageUrl: string;
	progress: string;
	prompt: string;
	promptEn: string;
	properties: Record<string, unknown>;
	startTime: number;
	state: string;
	status: string;
	submitTime: number;
}
/**
 * 指定ID获取任务
 * @param {string} id 任务ID
 * @returns
 */
export function Mjfetch(id: string): Promise<FetchRes> {
	return request.get(`/mj/task/${id}/fetch`);
}
