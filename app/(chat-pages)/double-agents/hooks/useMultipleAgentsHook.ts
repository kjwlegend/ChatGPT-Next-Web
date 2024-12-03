import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMultipleAgentStore } from "@/app/store/multiagents";
import { useConversationActions } from "./useConversationActions";
import { useUserStore } from "@/app/store/user";
import { Mask } from "@/app/types/mask";
import {
	getMultiAgentSession,
	getMultiAgentSessionChats,
	updateMultiAgentSession,
} from "@/app/services/api/chats";
import { Path } from "@/app/constant";

export const useMultipleAgentsChatHook = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);
	const store = useMultipleAgentStore();
	const { startNewConversation, addAgent: addAgentToConversation } =
		useConversationActions();

	const [chatSessions, setChatSessions] = useState(store.conversations);

	// 使用 useEffect 监听会话变化
	useEffect(() => {
		setChatSessions(store.conversations);
	}, [store.conversations]);

	const loadMoreSessions = async (page: number) => {
		try {
			const res = await getMultiAgentSession({ limit: 20, page });
			store.fetchNewConversations(res.data);
			return {
				data: store.conversations,
				is_next: res.is_next,
			};
		} catch {
			throw new Error("登录已过期");
		}
	};

	const handleAddClick = () => {
		startNewConversation();
	};

	const handleChatItemClick = async (id: string) => {
		store.setCurrentConversationId(id);

		const res = await getMultiAgentSessionChats({ limit: 60 }, id);
		store.fetchNewMessages(id, res.data);

		navigate(Path.Chat);
	};

	const handleChatItemDelete = async (id: string | number) => {
		try {
			await updateMultiAgentSession({ user: userid, active: false }, id);
			store.deleteConversation(id);
		} catch (error) {
			console.error("Delete chat session error", error);
		}
	};

	const handleAgentClick = (agent: Mask) => {
		addAgentToConversation(agent);
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
