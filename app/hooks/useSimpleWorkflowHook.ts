import { useState, useEffect } from "react";

import {
	deleteWorkflowSession,
	getWorkflowSession,
	updateMultiAgentSession,
	updateWorkflowSession,
} from "@/app/services/chats";

import { Path } from "../constant";
import { useNavigate } from "react-router-dom";
import { getMultiAgentSession } from "../services/chats";
import usedoubleAgent, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import { useDoubleAgentChatContext } from "../(chat-pages)/double-agents/doubleAgentContext";
import { useUserStore } from "../store";
import { useWorkflowStore } from "../store/workflow";
import { useWorkflowContext } from "../(chat-pages)/workflow-chats/workflowContext";

export const useSimpleWorkflowService = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);
	const {
		workflowGroups,
		selectedId,
		setSelectedId,
		deleteWorkflowGroup,
		addWorkflowGroup,
		updateSingleWorkflowGroup,
		fetchNewWorkflowGroup,
	} = useWorkflowContext();

	const [chatSessions, setChatSessions] = useState<any[]>(workflowGroups);

	const loadMoreSessions = async (page: number) => {
		const param = { limit: 20, page };
		try {
			const res = await getWorkflowSession(param);
			fetchNewWorkflowGroup(res.data);
			const newsessions = workflowGroups;
			console.log("loadmore sessions", newsessions);
			return { data: newsessions, is_next: res.is_next };
		} catch {
			throw new Error("登录已过期");
		}
	};
	// 监听 chatStore.sessions 的变化
	useEffect(() => {
		const updateChatSessions = () => {
			setChatSessions(workflowGroups);
		};

		updateChatSessions(); // 初始化时更新一次
	}, [workflowGroups, loadMoreSessions]);

	const handleAddClick = () => {
		console.log("click");
		addWorkflowGroup();
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
		setSelectedId(id);
		// getMessages(item.id);
		navigate(Path.Chat);
	};

	const handleChatItemDelete = async (id: number) => {
		try {
			deleteWorkflowGroup(id);
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
