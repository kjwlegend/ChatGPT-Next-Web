import { ChatSession, ChatMessage } from "../store";
import { useChatStore } from "../store";
import { useUserStore } from "../store";
import { RequestMessage, api } from "../client/api";
import { SUMMARIZE_MODEL } from "../constant";
import { createMessage } from "../store";

import {
	ImagineParams,
	ChangeParams,
	Mjfetch,
	change,
	imagine,
	FetchRes,
} from "../api/midjourney/tasksubmit";

import { createPaintings, updatePaintings } from "../api/backend/paintings";

export async function midjourneyOnUserInput(
	content: string,
	image_url?: string,
	_session?: ChatSession,
	action?: any,
	taskId?: string,
	index?: number,
) {
	const chatStoreState = useChatStore.getState();

	const session = chatStoreState.getSession(_session);

	const sessionModel = session.mask.modelConfig.model;

	const userid = useUserStore.getState().user.id;

	let response;
	let newcontent = "";
	// define initialize userMessage with empty
	let userMessage: any = {
		role: "user",
		content: "",
		image_url: image_url,
	};

	const chatOptions = {
		messages: [] as RequestMessage[],
		config: {
			temperature: 0,
			top_p: 1,
			model: SUMMARIZE_MODEL,
			stream: false,
		},
		onUpdate: (message: string) => {
			console.log("onUpdate: ", message);
		},
		onFinish: (message: string) => {
			console.log("onFinish: ", message);
			newcontent = message;
		},
		onError: (error: Error) => {
			console.log("onError: ", error);
		},
		onController: (controller: AbortController) => {
			console.log("onController: ", controller);
		},
	};

	const positionMap: Record<number, string> = {
		1: "左上",
		2: "右上",
		3: "左下",
		4: "右下",
	};

	const actionMap: Record<string, string> = {
		UPSCALE: "放大",
		VARIATION: "变换",
	};

	// 创建一个botMessage, 提示请求已提交
	const imagineParams: ImagineParams = {
		base64Array: [],
		notifyHook: "",
		prompt: content,
	};

	const changeParams: ChangeParams = {
		action: action ?? "UPSCALE",
		index: index,
		taskId: taskId ?? "",
	};

	//  判断是否有taskId 来判断任务类型, 有的话则是 await change, 没有的话则是 imagine
	if (index && taskId && content == "") {
		// 在这个模式时 userMessage 做出变换
		const positionLabel = positionMap[index];
		const actionLabel = actionMap[action];
		const origintext = `${actionLabel}请求已提交 - ${positionLabel}`;

		chatOptions.messages = [
			{
				role: "user",
				content:
					"你需要将用户输入的内容,用一种幽默, 但又有哲理的的口吻的风格说出来, 但需要保留原本的意思,不超过30个字, 用户的内容是:" +
					origintext,
			},
		];

		await api.llm.chat(chatOptions);

		userMessage = createMessage({
			role: "user",
			content: ` ${newcontent}`,
			image_url: image_url,
		});

		response = await change(changeParams);
	}

	if (!taskId && content !== "") {
		// 将content 进行翻译 并赋值到 translateprompt
		// 用于 imagineParams.prompt

		userMessage = createMessage({
			role: "user",
			content: content,
			image_url: image_url,
		});

		chatOptions.messages = [
			{
				role: "user",
				content:
					"Translate and optimize the description into English if the content is not written in English. if the original text ends with '--ar {text}'. for example '--style raw'. Do not translate '--ar {text}' part and put them at the end of translation. if the original content doesn't have '--ar {text}', do not add anythign in the end. Only output the final translation text. Here are the content ::" +
					content,
			},
		];

		await api.llm.chat(chatOptions);
		const suffix = Object.values(session.mjConfig).join(" ");

		imagineParams.prompt = newcontent + " " + suffix;

		response = await imagine(imagineParams);
	}

	try {
		// 调用 imagine 函数并等待结果
		console.log(response);
		if (response.status !== 200) {
			throw new Error("imagine failed");
		}
		const res = response.data;

		// 获取绘画请求的描述和结果ID
		const description = res.description;
		const resultId = res.result; // 绘画任务的ID
		const message =
			"你的绘画请求: " +
			description +
			"\n请耐心等待，请求id: " +
			resultId +
			"\n原提示词 : " +
			content +
			"\n" +
			"翻译提示词: " +
			imagineParams.prompt;

		// 创建botMessage，提示请求已提交
		const botMessage: ChatMessage = createMessage({
			role: "assistant",
			content: message,
			image_url: image_url,
			mjSessions: res,
		});

		// update mjSessions.promptInput
		if (botMessage.mjSessions) {
			botMessage.mjSessions.promptInput = content;
		}

		console.log("Mjsession", botMessage.mjSessions);

		const paintingsParams = {
			action: res.action,
			image_url: "",
			model: "midjourney",
			prompt: content ? content : newcontent,
			prompt_en: newcontent,
			publish: true,
			status: res.description,
			task_id: res.result,
			user: userid,
		};

		const id = await createPaintings(paintingsParams).then((res) => res.id);
		console.log("post: ", id);

		const botMessageId = botMessage.id;

		chatStoreState.updateSession(session.id, () => {
			session.messages = session.messages.concat([userMessage, botMessage]);
		});
		console.log("botMessageId: ", botMessageId);

		// 获取当前时间作为开始时间
		const startTime = Date.now();

		// 开始轮询绘画进度
		pollForProgress(session, id, resultId, message, botMessageId, startTime);
	} catch (err: any) {
		// 处理错误情况
		console.log(err);

		const botMessage: ChatMessage = createMessage({
			role: "assistant",
			content: "生成失败, 请重试",
			image_url: image_url,
		});
		chatStoreState.updateSession(session.id, () => {
			session.messages = session.messages.concat([userMessage, botMessage]);
		});
	}
}

// 定义一个函数用于轮询绘画进度
export async function pollForProgress(
	session: ChatSession,
	id: number, // 绘画任务的ID
	mjtaskid: string,
	message: string,
	botMessageId: string,
	startTime: number,
	failureCount: number = 0,
) {
	const chatStoreState = useChatStore.getState();

	try {
		const res = await Mjfetch(mjtaskid);
		const fetchRes = res.data as FetchRes;
		const currentTime = Date.now();
		const elapsedTime = currentTime - startTime;

		let content = "";
		let imageUrl = "";

		switch (fetchRes.status) {
			case "IN_PROGRESS":
				content =
					message +
					`\n 绘画正在加紧绘制中, 已耗时：${(elapsedTime / 1000).toFixed(
						2,
					)}秒。 进度：${fetchRes.progress}`;
				break;
			case "SUCCESS":
				let filePath = await fetch("/api/file/mjupload", {
					method: "POST",
					body: JSON.stringify({
						url: fetchRes.imageUrl,
					}),
				})
					.then((res) => res.json())
					.then((res) => res.fileName);
				console.log("filePath: ", filePath);
				if (!filePath) {
					filePath = fetchRes.imageUrl;
				}

				const paintingsParams = {
					action: fetchRes.action,
					image_url: filePath,
					model: "midjourney",
					prompt_en: fetchRes.promptEn,
					status: fetchRes.status,
					publish: true,
					task_id: fetchRes.id,
					user: useUserStore.getState().user.id,
				};

				const post = await updatePaintings(id, paintingsParams);
				console.log("post: ", post);

				content =
					message +
					`\n 绘画已完成！总耗时：${(elapsedTime / 1000).toFixed(
						2,
					)}秒。\n查看结果: \n [![${mjtaskid}](${filePath})](${filePath})`;

				break;
			case "FAILURE":
			case "TIMEOUT": // 假设这是超时的状态
				content =
					message +
					`\n 绘画任务失败或超时。总耗时：${(elapsedTime / 1000).toFixed(
						2,
					)}秒。失败理由：${fetchRes.failReason}`;
				break;
			default:
				setTimeout(
					() =>
						pollForProgress(
							session,
							id,
							mjtaskid,
							message,
							botMessageId,
							startTime,
							failureCount,
						),
					10000,
				);
				return;
		}

		// 更新会话消息
		chatStoreState.updateSessionMessage(
			session,
			botMessageId,
			content,
			imageUrl,
			fetchRes,
		);

		if (fetchRes.status === "IN_PROGRESS") {
			setTimeout(
				() =>
					pollForProgress(
						session,
						id,
						mjtaskid,
						message,
						botMessageId,
						startTime,
						failureCount,
					),
				10000,
			);
		}
	} catch (error) {
		console.error("Error fetching progress:", error);
		failureCount += 1;
		if (failureCount >= 5) {
			chatStoreState.updateSessionMessage(
				// 更新会话消息
				session,
				botMessageId,
				"接口调用失败超过5次。任务中止。",
			);
		}
	}
}
