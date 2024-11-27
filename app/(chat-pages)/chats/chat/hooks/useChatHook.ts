import {
	getChatSession,
	getChatSessionMessages,
} from "@/app/services/api/chats";
import { useAccessStore, useAppConfig } from "../../../../store";
import { useChatStore } from "@/app/store/chat/index";

import { Path } from "../../../../constant";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, use } from "react";
import { ChatMessage, ChatSession } from "@/app/types/chat";

import { createEmptyMask } from "@/app/store/mask/utils";
import { DEFAULT_TOPIC } from "@/app/store/chat";
import { useChatSetting } from "./useChatContext";
import { useGlobalLoading } from "@/app/contexts/GlobalLoadingContext";

export const useChatService = () => {
	const chatStore = useChatStore();
	const sessionlist = chatStore.selectAllSessions();
	const navigate = useNavigate();
	const config = useAppConfig();

	const { isLoading, setIsLoading } = useGlobalLoading();

	const loadMoreSessions = useCallback(
		async (page: number) => {
			const param = { limit: 15, page };
			try {
				const res = await getChatSession(param);
				updateChatSessions(res.data);
				return {
					data: chatStore.selectAllSessions(),
					is_next: res.is_next,
				};
			} catch {
				throw new Error("登录已过期");
			}
		},
		[chatStore],
	);

	const handleAddClick = useCallback(() => {
		if (config.dontShowMaskSplashScreen) {
			chatStore.create();
			navigate(Path.Chat);
		} else {
			navigate(Path.NewChat);
		}
	}, []);

	const handleChatItemClick = useCallback(
		async (id: string) => {
			console.log(
				"handleChatItemClick started, setting isLoading to true. click id:",
				id,
			);
			setIsLoading(true);
			chatStore.setCurrentSessionId(id);

			const param = { limit: 60 };
			try {
				console.log("Fetching chat session chats...");
				const res = await getChatSessionMessages(param, id);
				const chats = res.data;
				console.log("chats: ", chats);
				UpdateChatMessages(id, chats);
				navigate(Path.Chat);
			} catch (error) {
				console.log("get chatSession list error", error);
			} finally {
				console.log("Setting isLoading to false");
				setIsLoading(false);
			}
		},
		[chatStore, navigate, setIsLoading],
	);

	const handleChatItemDelete = useCallback(
		async (id: number) => {
			console.log("click delete", id);
			try {
				console.log("delete session", id);
				await chatStore.deleteSession(id.toString());
			} catch (error) {
				console.log("Delete chat session error", error);
			}
		},
		[chatStore],
	);

	return {
		chatSessions: sessionlist,
		isLoading,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	};
};
// 获取chatsession 列表
export function updateChatSessions(newSessionsData: any[]) {
	const chatStore = useChatStore.getState();
	const allSessions = chatStore.selectAllSessions();

	// 创建一个映射以提高查找效率
	const sessionMap = new Map(allSessions.map((s) => [s.id, s]));

	newSessionsData.forEach((sessionData) => {
		const existingSession = sessionMap.get(sessionData.id);
		const newSession: ChatSession = {
			id: sessionData.id,
			session_id: sessionData.session_id,
			topic: sessionData.session_topic ?? DEFAULT_TOPIC,
			memoryPrompt: sessionData.session_summary,
			messages: [],
			stat: {
				tokenCount: sessionData.token_counts_total,
			},
			lastSummarizeIndex: 0,
			clearContextIndex: undefined,
			mask: sessionData.custom_agent_data
				? {
						...sessionData.custom_agent_data,
						context: sessionData.custom_agent_data.prompts_data ?? [],
						intro: sessionData.custom_agent_data.chat_intro ?? "",
						name: sessionData.custom_agent_data.agent_name ?? "",
						img: sessionData.custom_agent_data.image ?? "",
						hideContext: sessionData.custom_agent_data.hideContext ?? true,
						plugins: sessionData.custom_agent_data.plugins ?? [],
					}
				: createEmptyMask(),
			responseStatus: undefined,
			isworkflow: false,
			mjConfig: sessionData.mjConfig,
			chat_count: 0,
			updated_at: sessionData.updated_at,
			created_at: sessionData.created_at,
			lastUpdateTime: Date.parse(sessionData.updated_at),
		};

		if (!existingSession) {
			chatStore.add(newSession);
			console.log("add new session: ", newSession.id);
		} else if (newSession.lastUpdateTime! > existingSession.lastUpdateTime) {
			chatStore.updateSession(newSession.id!, () => newSession);
		}
	});
}

// 获取chatsession 对应的messages
export function UpdateChatMessages(id: string | number, messagesData: any[]) {
	const chatStore = useChatStore.getState();
	const session = chatStore.selectSessionById(id.toString());
	if (!session) return;
	const session_id = session.id;

	messagesData.forEach((messageData) => {
		// 检查是否已经存在该消息
		const exists = session?.messages.some((m) => m.id == messageData.id);
		if (exists) {
			// console.log("message already exists: ", messageData.id);
			return;
		}

		const newMessage: ChatMessage = {
			id: messageData.id.toString(),
			chat_id: messageData.chat_id.toString(),
			role: messageData.chat_role, // 确保这里的转换是安全的
			image_url: messageData.chat_images,
			date: messageData.created_at,
			content: messageData.content,
			function_calls: messageData.function_calls,
			token_counts_total: messageData.token_counts_total,
			sender_name: messageData.sender_name,
			chat_model: messageData.chat_model,
		};
		// console.log("newMessage: ", newMessage);

		// 使用 chatStore 的方法来添加新消息
		chatStore.addMessageToSession(session_id, newMessage);
	});
}
