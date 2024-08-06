import { useState, useEffect } from "react";

import { updateMultiAgentSession } from "@/app/services/chats";

import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
import { getMultiAgentSession } from "../services/chats";
import usedoubleAgent, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import { useDoubleAgentChatContext } from "../(chat-pages)/double-agents/doubleAgentContext";
import { useUserStore } from "../store";

export const useMultipleAgentsChatService = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);

	const {
		conversations,
		currentConversationId,
		setCurrentConversationId,
		deleteConversation,
		fetchNewConversations,
		sortedConversations,
	} = usedoubleAgent();

	const [chatSessions, setChatSessions] = useState<any[]>(conversations);
	const { startNewConversation } = useDoubleAgentChatContext();

	const loadMoreSessions = async (page: number) => {
		const param = { limit: 20, page };
		try {
			const res = await getMultiAgentSession(param);
			fetchNewConversations(res.data);
			const newsessions = conversations;
			console.log("loadmore sessions", newsessions);
			return { data: newsessions, is_next: res.is_next };
		} catch {
			throw new Error("登录已过期");
		}
	};
	// 监听 chatStore.sessions 的变化
	useEffect(() => {
		const updateChatSessions = () => {
			setChatSessions(conversations);
		};

		updateChatSessions(); // 初始化时更新一次
	}, [conversations, loadMoreSessions]);

	const handleAddClick = () => {
		console.log("click");
		startNewConversation();
	};

	const handleChatItemClick = async (id: string) => {
		const param = { limit: 60 };
		try {
			// const chatSessionList = await getChatSessionChats(param, id);
			// const chats = chatSessionList.results;
			// UpdateChatMessages(id, chats);
		} catch (error) {
			console.log("get chatSession list error", error);
		}
		setCurrentConversationId(id);
		// getMessages(item.id);
		navigate(Path.Chat);
	};

	const handleChatItemDelete = async (id: string | number) => {
		try {
			// await chatStore.deleteSession(id);
			const res = await updateMultiAgentSession(
				{ user: userid, active: false },
				id,
			);
			deleteConversation(id);
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
