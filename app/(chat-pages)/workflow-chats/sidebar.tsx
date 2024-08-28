"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/(chat-pages)/chats/home.module.scss";

import { useWorkflowStore } from "../../store/workflow";

import { message } from "antd";
import { WorkflowGroup } from "../../store/workflow";

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

	const workflowGroups = useWorkflowGroups();
	const workflowSessions = useWorkflowSessions();
	console.log("workflowSessions", workflowSessions);

	if (!workflowGroups) return;

	//  change chatsessions from object type to array type
	const [editWrokflow, setEditWorkflow] = useState<WorkflowGroup | undefined>();
	const [showWorkflowModal, setShowWorkflowModal] = useState(false);
	const [agentList, setAgentList] = useState<any[]>([]);
	const [sessions, setSessions] = useState<any[]>([]);

	// 每次 workflowSessions 变化时, 重新渲染
	useEffect(() => {
		console.log("workflowSessions updated", workflowSessions);
		setSessions(workflowSessions);
	}, [workflowSessions]);

	// 打印 sessions 确认其更新
	useEffect(() => {
		console.log(
			"sessions",
			sessions.map((session) => session.id),
		);
	}, [sessions]);

	const handleItemEditClick = (workflowgroupId: string | number) => {
		console.log("workflow group id", workflowgroupId);
		const currentWorkflowGroup = workflowGroups.find(
			(item) => item.id === workflowgroupId,
		);

		// 确保在点击时使用最新的 sessions
		console.log("sessions in itemedit click", sessions);
		const currentWorkflowGroupSessions =
			sessions.filter(
				(session) => session.workflow_group_id === workflowgroupId,
			) ?? [];

		setEditWorkflow(currentWorkflowGroup);
		setAgentList(currentWorkflowGroupSessions);
		console.log("currentWorkflowGroupSessions", currentWorkflowGroupSessions);
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
