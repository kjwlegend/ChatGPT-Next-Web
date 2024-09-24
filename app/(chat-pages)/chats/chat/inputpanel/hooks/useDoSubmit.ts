import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/app/store/auth";
import { message } from "antd";

import {
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	Theme,
	useAppConfig,
	ModelType,
	useUserStore,
} from "@/app/store";
import useAuth from "@/app/hooks/useAuth";

import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
	UNFINISHED_INPUT,
	LAST_INPUT_IMAGE_KEY,
} from "@/app/constant";
import { FileInfo } from "@/app/client/platforms/utils";
import { useWorkflowStore } from "@/app/store/workflow";
import { useMultipleAgentStore } from "@/app/store/multiagents";
import { sendNextAgentMessage } from "@/app/(chat-pages)/double-agents/MultiAgentService";

export function useDoSubmit(
	session: any,
	attachImages: string[],
	attachFiles: FileInfo[],
	submitType: "chat" | "workflow" | "multi-agent" = "chat", // 根据需要定义类型
	onError: (message: string) => void, // 新增的错误回调函数
) {
	const chatStore = useChatStore.getState();
	const userStore = useUserStore.getState();
	const multiAgentStore = useMultipleAgentStore.getState();
	const { round, totalRounds } = multiAgentStore.currentSession();
	const workflowStore = useWorkflowStore.getState();
	const authHook = useAuth();
	const [messageApi, contextHolder] = message.useMessage();
	const [isLoading, setIsLoading] = useState(false);

	const { updateUserInfo } = authHook;

	const doSubmit = async (userInput: string) => {
		if (userInput.trim() === "") return;

		setIsLoading(true);
		try {
			let result;
			if (submitType === "chat") {
				console.log("chat sbumit");
				result = await chatStore.onUserInput(
					userInput,
					attachImages,
					attachFiles,
					session,
				);
			} else if (submitType === "workflow") {
				console.log("workflow submit");
				result = await workflowStore.onUserInput(
					userInput,
					attachImages,
					attachFiles,
					session,
				);
			} else if (submitType === "multi-agent") {
				// 其他逻辑
				console.log("multi-agent submit");
				if (userInput.length === 0) {
					onError("信息不能为空");
					return null;
				}
				if (userInput.length > 1000) {
					onError("信息长度超过限制");
					return null;
				}
				if (round === totalRounds) {
					onError("对话已结束");
					return null;
				}

				result = await multiAgentStore.onUserInput(
					userInput,
					attachImages,
					attachFiles,
					session,
				);
				sendNextAgentMessage(session.id, userInput,attachImages);
				console.log("multi-agent submit", result);
			} else {
				throw new Error("Invalid submit type");
			}

			updateUserInfo(userStore.user.id);
		} catch (error: any) {
			console.error(error.message);
			onError(error.message); // 使用回调函数处理错误
		} finally {
			setIsLoading(false);
		}

		localStorage.setItem(LAST_INPUT_KEY, userInput);
		return { isLoading };
	};

	return { doSubmit, isLoading, contextHolder };
}
