"use client";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { useWorkflowStore } from "@/app/store/workflow";

import {
	sessionConfig,
	workflowChatSession,
	WorkflowGroup,
} from "@/app/types/";
import { createEmptySession, useUserStore } from "@/app/store";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { message } from "antd";

import {
	createWorkflowSession,
	getWorkflowSession,
	updateWorkflowSession,
	deleteWorkflowSession,
	createWorkflowSessionChatGroup,
	deleteWorkflowSessionChatGroup,
	updateWorkflowSessionChatGroupOrder,
	getWorkflowSessionChats,
} from "@/app/services/api/chats";
import { useMaskStore } from "@/app/store/mask/index";

export const WORKFLOW_DEFAULT_TITLE = "未定义工作流";

interface WorkflowContextValue {
	selectedId: string;
	workflowGroups: Array<WorkflowGroup>;
}

export const workflowGroupsContext = createContext<WorkflowContextValue>({
	selectedId: "",
	workflowGroups: [],
});
export const workflowSessionsContext = createContext<sessionConfig[]>([]);

const ModalContext = createContext<{
	showAgentList: boolean;
	openAgentList: () => void;
	closeAgentList: () => void;
}>({
	showAgentList: false,
	openAgentList: () => {},
	closeAgentList: () => {},
});

export const WorkflowProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { workflowGroups, selectedId, workflowSessions } = useWorkflowStore();
	const [showAgentList, setShowAgentList] = useState(false);
	const openAgentList = useCallback(() => setShowAgentList(true), []);
	const closeAgentList = useCallback(() => setShowAgentList(false), []);

	return (
		<workflowSessionsContext.Provider value={workflowSessions}>
			<workflowGroupsContext.Provider value={{ selectedId, workflowGroups }}>
				<ModalContext.Provider
					value={{ showAgentList, openAgentList, closeAgentList }}
				>
					{children}
				</ModalContext.Provider>
			</workflowGroupsContext.Provider>
		</workflowSessionsContext.Provider>
	);
};

// 自定义钩子
export const useWorkflowGroups = () => {
	const { selectedId, workflowGroups } = useContext(workflowGroupsContext);

	return { selectedId, workflowGroups };
};

export const useWorkflowSessions = () => {
	const context = useContext(workflowSessionsContext);
	if (context === undefined) {
		throw new Error(
			"useworkflowSessions must be used within a WorkflowProvider",
		);
	}
	return context;
};

export const useAgentListModal = () => {
	const { showAgentList, openAgentList, closeAgentList } =
		useContext(ModalContext);
	return { showAgentList, openAgentList, closeAgentList };
};

export default WorkflowProvider;
