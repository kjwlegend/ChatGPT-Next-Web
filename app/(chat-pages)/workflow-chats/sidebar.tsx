"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/(chat-pages)/chats/home.module.scss";

import { useWorkflowStore } from "../../store/workflow";

import { message } from "antd";
import { WorkflowGroup } from "@/app/types/";

import { useWorkflowGroups, useWorkflowSessions } from "./workflowContext";
import { useSimpleWorkflowService } from "@/app/(chat-pages)/workflow-chats/hooks/useSimpleWorkflowHook";
import { SideBar } from "@/app/(chat-pages)/chats/sidebar/sidebar";
import ChatList from "@/app/(chat-pages)/chats/sidebar/chatList";
import { WorkflowModalConfig } from "./modal";

export function WorkflowSidebar(props: { className?: string }) {
	const {
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useSimpleWorkflowService();

	const { workflowGroups } = useWorkflowGroups();
	const { workflowSessions } = useWorkflowStore();

	if (!workflowGroups) return;

	//  change chatsessions from object type to array type
	const [editWrokflow, setEditWorkflow] = useState<WorkflowGroup | undefined>();
	const [showWorkflowModal, setShowWorkflowModal] = useState(false);
	const [agentList, setAgentList] = useState<any[]>([]);

	// 使用 useRef 来存储最新的 workflowSessions
	const workflowSessionsRef = useRef(workflowSessions);

	// 每次 workflowSessions 变化时更新 ref
	useEffect(() => {
		workflowSessionsRef.current = workflowSessions;
	}, [workflowSessions]);

	const getSessions = useCallback((workflowGroupId: string | number) => {
		const currentWorkflowSessions = workflowSessionsRef.current;

		if (!currentWorkflowSessions) return [];

		return currentWorkflowSessions.filter(
			(session) => session.workflow_group_id === workflowGroupId,
		);
	}, []);

	const getWorkflowGroup = (workflowGroupId: string | number) => {
		return workflowGroups.find((group) => group.id === workflowGroupId);
	};

	const handleItemEditClick = (workflowgroupId: string | number) => {
		// 找到当前的 workflowGroup 和 sesions

		const currentWorkflowGroup = getWorkflowGroup(workflowgroupId);
		const currentAgents = getSessions(workflowgroupId);

		setEditWorkflow(currentWorkflowGroup);
		setAgentList(currentAgents);

		setShowWorkflowModal(true);
	};

	return (
		<>
			<SideBar
				className={styles["sidebar-show"]}
				chatSessions={workflowGroups}
				loadMoreSessions={loadMoreSessions}
				onAddClick={handleAddClick}
				onChatItemClick={handleChatItemClick}
				onChatItemDelete={handleChatItemDelete}
				onChatItemEdit={handleItemEditClick}
				ChatListComponent={ChatList}
			/>
			{showWorkflowModal && (
				<WorkflowModalConfig
					workflow={editWrokflow!}
					workflowSessions={agentList}
					onClose={() => setShowWorkflowModal(false)}
				/>
			)}
		</>
	);
}
