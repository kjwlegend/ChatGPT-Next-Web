// useMessageActions.ts
import { useCallback } from "react";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import { useChatStore } from "@/app/store/chat/index";
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
import { getMessageImages, getMessageTextContent } from "@/app/utils";
import { useChatActions } from "../hooks/useChatContext";
import { useWorkflowStore } from "@/app/store/workflow";
import { sessionConfigUpdate } from "../../utils/chatUtils";
import { sessionConfig, workflowChatSession } from "@/app/types/";

interface UseMessageActions {
	handleUserStop: (messageId: string) => void;
	handleResend: (message: ChatMessage) => void;
	handleDelete: (messageId: string) => void;
	handlePinMessage: (message: ChatMessage) => void;
	handlePlayAudio: (message: ChatMessage) => void;
}

export const useMessageActions = (
	session: sessionConfig,
	setShowPromptModal: (show: boolean) => void,
): UseMessageActions => {
	const chatStore = useChatStore.getState();
	const workflowStore = useWorkflowStore.getState();

	const updateType = session.workflow_group_id ? "workflow" : "chat";

	const workflowGroupId =
		updateType == "workflow" ? session.workflow_group_id : null;

	const sessionid = session.id;

	const handleUserStop = useCallback(
		(messageId: string) => {
			// 用户停止操作逻辑
			ChatControllerPool.stop(sessionid, messageId);
		},
		[sessionid],
	);

	const handleResend = useCallback(
		(message: ChatMessage) => {
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
			if (updateType == "chat") {
				chatStore.onUserInput(
					getMessageTextContent(userMessage),
					getMessageImages(userMessage),
					undefined,
					session as ChatSession,
				);
			} else {
				workflowStore.onUserInput(
					getMessageTextContent(userMessage),
					getMessageImages(userMessage),
					undefined,
					session as workflowChatSession,
				);
			}
		},
		[session, sessionid, sessionConfigUpdate],
	);

	const handleDelete = useCallback(
		(messageId: string) => {
			if (!session.messages) {
				console.error("session.messages is not defined");
				return;
			}

			const updatedMessages = session.messages.filter(
				(m) => m.id !== messageId,
			);

			// console.log("message click delete", messageId);
			// console.log("updatedMessages", updatedMessages);

			sessionConfigUpdate(updateType, {
				groupId: workflowGroupId,
				sessionId: sessionid,
				updates: {
					messages: updatedMessages,
				},
			});
		},
		[session, sessionid, sessionConfigUpdate, updateType, workflowGroupId],
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
		[sessionid, setShowPromptModal],
	);

	const handlePlayAudio = useCallback(async (message: ChatMessage) => {
		const messageContent = getMessageTextContent(message);
		// 播放音频消息逻辑
		const regex = /[*_~`]/g;
		const newContent = messageContent.replace(regex, "");
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
