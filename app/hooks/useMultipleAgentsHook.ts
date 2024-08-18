import { useState, useEffect } from "react";

import { updateMultiAgentSession } from "@/app/services/chats";

import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
import { getMultiAgentSession } from "../services/chats";
import usedoubleAgent from "@/app/store/multiagents";
import { useMultiAgentChatContext } from "../(chat-pages)/double-agents/multiAgentContext";
import { useUserStore } from "../store";
import { Mask } from "@/app/types/mask";

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
	const { startNewConversation, addAgent } = useMultiAgentChatContext();

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
	}, [conversations, loadMoreSessions, startNewConversation]);

	const handleAddClick = () => {
		console.log("click");
		startNewConversation();
	};

	const handleChatItemClick = async (id: string) => {
		const param = { limit: 60 };

		setCurrentConversationId(id);
		try {
			console.log("multipleagents debug:, id", id);
		} catch (error) {
			console.log("get chatSession list error", error);
		}
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

	const handleAgentClick = (agent: Mask) => {
		console.log("multipleagents debug: agent click", agent);
		addAgent(agent);
	};

	return {
		chatSessions,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
		handleAgentClick,
	};
};
