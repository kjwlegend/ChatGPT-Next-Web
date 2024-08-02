import { getChatSession, getChatSessionChats } from "@/app/services/chats";
import { useAccessStore, useAppConfig, useChatStore } from "../store";
import {
	updateChatSessions,
	UpdateChatMessages,
} from "../services/chatService";
import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const useChatService = () => {
	const chatStore = useChatStore();
	const sessionlist = chatStore.sessions;
	const navigate = useNavigate();
	const config = useAppConfig();

	const [chatSessions, setChatSessions] = useState<any[]>([]);

	const loadMoreSessions = async (page: number) => {
		const param = { limit: 20, page };
		try {
			const res = await getChatSession(param);
			updateChatSessions(res.data);
			const newsessions = chatStore.sessions;
			setChatSessions(newsessions);
			return { data: newsessions, is_next: res.is_next };
		} catch {
			throw new Error("登录已过期");
		}
	};
	// 监听 chatStore.sessions 的变化
	useEffect(() => {
		const updateChatSessions = () => {
			setChatSessions(chatStore.sessions);
		};

		updateChatSessions(); // 初始化时更新一次

		// 订阅 chatStore 的变化
		// const unsubscribe = chatStore.subscribe(updateChatSessions);

		// 清理函数
		return () => {
			// unsubscribe();
		};
	}, [sessionlist, loadMoreSessions]);

	const handleAddClick = () => {
		if (config.dontShowMaskSplashScreen) {
			chatStore.newSession();
			navigate(Path.Chat);
		} else {
			navigate(Path.NewChat);
		}
	};

	const handleChatItemClick = async (id: string) => {
		const param = { limit: 60 };
		try {
			const chatSessionList = await getChatSessionChats(param, id);
			const chats = chatSessionList.data;
			UpdateChatMessages(id, chats);
		} catch (error) {
			console.log("get chatSession list error", error);
		}
		chatStore.selectSessionById(id);
		navigate(Path.Chat);
	};

	const handleChatItemDelete = async (id: number) => {
		console.log("click delete", id);
		try {
			await chatStore.deleteSession(id.toString());
		} catch (error) {
			console.log("Delete chat session error", error);
		}
	};

	return {
		chatSessions,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	};
};
