import { useState, useEffect } from "react";

import {
	getMultiAgentSessionChats,
	updateMultiAgentSession,
} from "@/app/services/api/chats";

import { Path } from "../../constant";
import { useNavigate } from "react-router-dom";
import { getMultiAgentSession } from "../../services/api/chats";
import { useMultipleAgentStore } from "@/app/store/multiagents";
import { useConversationActions } from "./multiAgentContext";
import { useUserStore } from "../../store";
import { Mask } from "@/app/types/mask";

export const useMultipleAgentsChatHook = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);

	const {
		conversations,
		currentConversationId,
		setCurrentConversationId,
		deleteConversation,
		fetchNewConversations,
		sortedConversations,
		fetchNewMessages,
	} = useMultipleAgentStore();

	const [chatSessions, setChatSessions] = useState<any[]>(conversations);
	const { startNewConversation, addAgent } = useConversationActions();

	const loadMoreSessions = async (page: number) => {
		const param = { limit: 20, page };
		try {
			const res = await getMultiAgentSession(param);
			fetchNewConversations(res.data);
			const newsessions = conversations;
			// console.log("loadmore sessions", newsessions);
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
		startNewConversation();
	};

	const handleChatItemClick = async (id: string) => {
		const param = { limit: 60 };

		setCurrentConversationId(id);

		const res = await getMultiAgentSessionChats(param, id);
		// 更新消息
		fetchNewMessages(id, res.data);
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
