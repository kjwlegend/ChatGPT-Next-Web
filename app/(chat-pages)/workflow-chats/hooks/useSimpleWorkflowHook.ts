import { useState, useEffect, useCallback } from "react";

import {
	deleteWorkflowSession,
	getWorkflowSession,
	updateMultiAgentSession,
	updateWorkflowSession,
} from "@/app/services/api/chats";

import { Path } from "../../../constant";
import { useNavigate } from "react-router-dom";
import { getMultiAgentSession } from "../../../services/api/chats";

import { useUserStore } from "../../../store";
import { useWorkflowStore } from "../../../store/workflow";
import {
	useWorkflowGroupActions,
	useWorkflowGroups,
	useWorkflowSessionActions,
} from "../workflowContext";
import { Mask } from "@/app/types/mask";

export const useSimpleWorkflowService = () => {
	const navigate = useNavigate();
	const userid = useUserStore((state) => state.user?.id);

	const {
		setSelectedId,
		deleteWorkflowGroup,
		addWorkflowGroup,
		fetchNewWorkflowGroup,
		addChatGrouptoWorkflow,
		getworkFlowSessions,
	} = useWorkflowGroupActions();

	const {
		fetchWorkflowChatSessionsHandler,
		fetchWorkflowChatSessionChatsHandler,
	} = useWorkflowSessionActions();

	const { workflowGroups, selectedId } = useWorkflowGroups();

	const [WorkflowGroupData, setWorkflowGroupData] =
		useState<any[]>(workflowGroups);

	const loadMoreSessions = useCallback(
		async (page: number) => {
			const param = { limit: 20, page };
			try {
				const res = await getworkFlowSessions(param);
				// fetchNewWorkflowGroup(res.data);
				const newsessions = workflowGroups;

				console.log("loadmore sessions", newsessions);
				return { data: newsessions, is_next: res.is_next };
			} catch {
				throw new Error("登录已过期");
			}
		},
		[workflowGroups, addChatGrouptoWorkflow, fetchNewWorkflowGroup],
	);

	useEffect(() => {
		const updateWorkflowGroup = () => {
			setWorkflowGroupData(workflowGroups);
		};

		updateWorkflowGroup(); // 初始化时更新一次
	}, [workflowGroups]);

	const handleAddClick = useCallback(() => {
		addWorkflowGroup();
	}, []);
	const handleChatItemClick = useCallback(
		async (id: string) => {
			console.log("aaaa");
			try {
				fetchWorkflowChatSessionChatsHandler(id);
			} catch (error) {
				console.log("get chatSession list error", error);
			}
			setSelectedId(id);
			// getMessages(item.id);
			navigate(Path.Chat);
		},
		[setSelectedId],
	);

	const handleChatItemDelete = useCallback(
		async (id: number) => {
			try {
				deleteWorkflowGroup(id);
			} catch (error) {
				console.log("Delete chat session error", error);
			}
		},
		[deleteWorkflowGroup],
	);

	const handleAgentClick = useCallback(
		async (agent: Mask) => {
			try {
				addChatGrouptoWorkflow(agent, selectedId);
			} catch (error) {
				console.log("Add agent to group error", error);
			}
		},
		[selectedId, addChatGrouptoWorkflow],
	);

	return {
		WorkflowGroupData,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
		handleAgentClick,
	};
};
