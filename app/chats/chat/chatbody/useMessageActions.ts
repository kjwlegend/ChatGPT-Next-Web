// useMessageActions.ts
import { useCallback } from "react";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import { useChatStore } from "@/app/store";
import {
	List,
	ListItem,
	Modal,
	Selector,
	showConfirm,
	showPrompt,
	showToast,
} from "@/app/components/ui-lib";
import Locale from "@/app/locales";

import { ChatControllerPool } from "@/app/client/controller";
import { message } from "antd";
import { convertTextToSpeech } from "@/app/utils/voicetotext";
import { SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

interface UseMessageActions {
	handleUserStop: (messageId: string) => void;
	handleResend: (message: ChatMessage) => void;
	handleDelete: (messageId: string) => void;
	handlePinMessage: (message: ChatMessage) => void;
	handlePlayAudio: (message: ChatMessage) => void;
}

export const useMessageActions = (
	session: ChatSession,
	setShowPromptModal: (show: boolean) => void,
): UseMessageActions => {
	const chatStore = useChatStore();
	const sessionid = session.id;

	const handleUserStop = useCallback((messageId: string) => {
		// 用户停止操作逻辑
		ChatControllerPool.stop(sessionid, messageId);
	}, []);

	const handleResend = useCallback((message: ChatMessage) => {
		// 消息重发逻辑
		// when it is resending a message
		// 1. for a user's message, find the next bot response
		// 2. for a bot's message, find the last user's input
		// 3. delete original user input and bot's message
		// 4. resend the user's input

		console.log("hooks, resend");
		const resendingIndex = session.messages.findIndex(
			(m) => m.id === message.id,
		);

		if (resendingIndex <= 0 || resendingIndex >= session.messages.length) {
			console.error("[Chat] failed to find resending message", message);
			return;
		}

		let userMessage: ChatMessage | undefined;
		let botMessage: ChatMessage | undefined;

		if (message.role === "assistant") {
			botMessage = message;
			for (let i = resendingIndex; i >= 0; i -= 1) {
				if (session.messages[i].role === "user") {
					userMessage = session.messages[i];
					break;
				}
			}
		} else if (message.role === "user") {
			userMessage = message;
			for (let i = resendingIndex; i < session.messages.length; i += 1) {
				if (session.messages[i].role === "assistant") {
					botMessage = session.messages[i];
					break;
				}
			}
		}

		if (userMessage === undefined) {
			console.error("[Chat] failed to resend", message);
			return;
		}

		handleDelete(userMessage.id);
		if (botMessage) handleDelete(botMessage.id);

		// setIsLoading(true);
		chatStore.onUserInput(userMessage.content, userMessage.image_url, session);
		// .then(() => setIsLoading(false));
		// inputRef.current?.focus();
	}, []);

	const handleDelete = useCallback(
		(messageId: string) => {
			chatStore.updateSession(sessionid, (session) => {
				// 注意这里使用了 session 来确保最新的会话状态被使用
				session.messages = session.messages.filter((m) => m.id !== messageId);
			});
		},
		[chatStore, sessionid],
	);

	const handlePinMessage = useCallback(
		(message: ChatMessage) => {
			// 消息置顶逻辑
			console.log("hooks");
			chatStore.updateSession(sessionid, () =>
				session.mask.context.push(message),
			);

			showToast(Locale.Chat.Actions.PinToastContent, {
				text: Locale.Chat.Actions.PinToastAction,
				onClick: () => {
					setShowPromptModal(true);
				},
			});
		},
		[chatStore, sessionid, setShowPromptModal],
	);

	const handlePlayAudio = useCallback(async (message: ChatMessage) => {
		// 播放音频消息逻辑
		const regex = /[*_~`]/g;
		const newContent = message.content.replace(regex, "");
		const newSynthesizer = await convertTextToSpeech(newContent);
	}, []);

	const handleCopyToClipboard = useCallback((message: string) => {}, []);

	const handleNextWorkflow = useCallback((message: string) => {}, []);
	return {
		handleUserStop,
		handleResend,
		handleDelete,
		handlePinMessage,
		handlePlayAudio,
	};
};
