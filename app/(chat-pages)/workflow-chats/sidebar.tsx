"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/(chat-pages)/chats/home.module.scss";

import { useWorkflowStore } from "../../store/workflow";

import { message } from "antd";
import { WorkflowGroup } from "../../store/workflow";

import { WorkflowContext, useWorkflowContext } from "./workflowContext";
import { useSimpleWorkflowService } from "@/app/hooks/useSimpleWorkflowHook";
import { SideBar } from "@/app/(chat-pages)/chats/sidebar/sidebar";
import { ChatList } from "@/app/(chat-pages)/chats/sidebar/chatList";
import { WorkflowModalConfig } from "./modal";
export function WorkflowSidebar(props: { className?: string }) {
	const {
		selectedId,
		WorkflowGroupData,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useSimpleWorkflowService();

	const { workflowSessionsIndex } = useWorkflowContext();

	const { workflowSessions } = useWorkflowStore();

	//  change chatsessions from object type to array type
	const [editWrokflow, setEditWorkflow] = useState<WorkflowGroup | null>(null);
	const [showWorkflowModal, setShowWorkflowModal] = useState(false);
	const [agentList, setagentList] = useState<any[]>([]);
	const handleItemEditClick = (workflowgroupId: string) => {
		console.log("workflow group id", workflowgroupId);
		const currentWorkflowGroup = WorkflowGroupData.find(
			(item) => item.id === workflowgroupId,
		);
		// 过滤出当前工作流组的所有会话
		const currentWorkflowGroupSessions =
			workflowSessions.filter(
				(session) => session.workflow_group_id === workflowgroupId,
			) ?? [];

		setEditWorkflow(currentWorkflowGroup);
		setagentList(currentWorkflowGroupSessions);
		console.log("currentworkflowGroupSessions", currentWorkflowGroupSessions);
		setShowWorkflowModal(true);
	};

	return (
		<>
			<SideBar
				className={styles["sidebar-show"]}
				chatSessions={WorkflowGroupData}
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
