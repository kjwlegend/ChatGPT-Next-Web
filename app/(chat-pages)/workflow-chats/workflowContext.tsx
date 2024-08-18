"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import {
	useWorkflowStore,
	workflowChatSession,
	WorkflowGroup,
} from "@/app/store/workflow";
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
} from "@/app/services/chats";
import { updateChatSessions } from "@/app/services/chatService";
import { useMaskStore } from "@/app/store/mask";

export const WORKFLOW_DEFAULT_TITLE = "未定义工作流";

interface WorkflowContextType {
	workflowGroups: WorkflowGroup[];
	selectedId: string;
	setSelectedId: (index: string) => void;
	addWorkflowGroup: () => void;
	deleteWorkflowGroup: (groupId: number) => void;
	fetchNewWorkflowGroup: (data: Array<WorkflowGroup>) => void;
	addChatGrouptoWorkflow: (groupId: string, Mask: Mask) => void;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	workflowSessions: workflowChatSession[];
	workflowSessionsIndex: { [key: string]: any[] };
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getworkFlowSessions: (param: any) => Promise<any>;
	updateWorkflowChatGroup: (
		groupId: string,
		newGroup: Partial<WorkflowGroup>,
	) => void;
}

export const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const WorkflowProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const {
		workflowGroups,
		selectedId,
		setSelectedId,
		addWorkflowGroup,
		updateWorkflowGroup,
		deleteWorkflowGroup,
		fetchNewWorkflowGroup,
		workflowSessions,
		workflowSessionsIndex,
		addSessionToGroup,
		moveSession,
		deleteSessionFromGroup,
		getWorkflowSessionId,
	} = useWorkflowStore();

	const [messageApi, contextHolder] = message.useMessage();

	const userid = useUserStore.getState().user.id;
	const maskStore = useMaskStore();

	const getworkFlowSessions = useCallback(async (param: any) => {
		const data = {
			user: userid,
			...param,
		};

		const res = await getWorkflowSession(data);

		if (res.code === 401) {
			throw new Error("登录状态已过期, 请重新登录");
		}

		if (res.data) {
			updateLocalWorkflowStoreHandler(res.data);
		}

		return res;
	}, []);

	const addWorkflowGroupHandler = useCallback(async () => {
		messageApi.open({
			content: "工作流组创建中",
			type: "loading",
		});
		try {
			const res = await createWorkflowSession({
				user: userid,
				session_topic: WORKFLOW_DEFAULT_TITLE,
			});
			console.log(res, "workflow");
			if (res.id) {
				addWorkflowGroup(res.id, WORKFLOW_DEFAULT_TITLE);
				messageApi.destroy();
				messageApi.success("工作流组创建成功");
			}

			if (res.code === 401) {
				messageApi.error("创建失败, 请尝试重新登录");
				throw new Error("登录状态已过期, 请重新登录");
			}
		} catch (error: any) {
			messageApi.error(`工作流组创建失败: ${error}`);
		}
	}, [addWorkflowGroup, userid]);

	const deleteWorkflowGroupHandler = useCallback(
		async (groupId: number) => {
			messageApi.open({
				content: "工作流组删除中",
				type: "loading",
			});
			try {
				const res = await deleteWorkflowSession({ active: false }, groupId);
				if (res.code === 401) {
					throw new Error("登录状态已过期, 请重新登录");
				}

				deleteWorkflowGroup(groupId);
				messageApi.destroy();
				messageApi.success("工作流组删除成功");
			} catch (error: any) {
				messageApi.error(`工作流组删除失败: ${error.message}`);
			}
		},
		[deleteWorkflowGroup],
	);

	const addChatGrouptoWorkflowHandler = useCallback(
		//
		async (groupId: string, agent: Mask) => {
			messageApi.open({
				content: "会话添加中",
				type: "loading",
			});
			try {
				const apidata = {
					agent: agent.id,
					workflow_session: groupId,
				};
				console.log(apidata, "apidata");
				const mask = maskStore.get(agent.id);
				console.log(mask, "mask");
				const res = await createWorkflowSessionChatGroup(apidata, groupId);
				const newsession = createEmptySession({ id: res.id, mask });
				addSessionToGroup(groupId, newsession);
				messageApi.destroy();
				messageApi.success("会话添加成功");
			} catch (error: any) {
				messageApi.error(`会话添加失败: ${error.message}`);
			}
		},
		[addSessionToGroup],
	);

	const moveSessionHandler = useCallback(
		async (groupId: string, sourceIndex: number, destinationIndex: number) => {
			messageApi.open({
				content: "会话移动中",
				type: "loading",
			});
			try {
				moveSession(groupId, sourceIndex, destinationIndex);
				const newSessions = useWorkflowStore.getState().workflowSessions;
				console.log(workflowSessions, "workflowSessions");
				const updatedSessions = newSessions
					.filter((session) => session.workflow_group_id === groupId)
					.map((session) => ({
						id: session.id,
						order: session.order,
					}));

				console.log(updatedSessions, "updatedSessions");

				const res = await updateWorkflowSessionChatGroupOrder(
					{
						chat_group_orders: updatedSessions,
						user: userid,
					},
					groupId,
				);
				if (res.code === 401) {
					throw new Error("登录状态已过期, 请重新登录");
				}
				messageApi.destroy();

				messageApi.success("会话移动成功");
			} catch (error: any) {
				messageApi.error(`会话移动失败: ${error.message}`);
			}
		},
		[moveSession],
	);

	const deleteSessionFromGroupHandler = useCallback(
		async (groupId: string, sessionId: string) => {
			messageApi.open({
				content: "会话删除中",
				type: "loading",
			});
			try {
				deleteSessionFromGroup(groupId, sessionId);
				const res = await deleteWorkflowSessionChatGroup(
					{
						chat_group_id: sessionId,
					},
					groupId,
				);
				if (res.code === 401) {
					throw new Error("登录状态已过期, 请重新登录");
				}

				messageApi.destroy();
				messageApi.success("会话删除成功");
			} catch (error: any) {
				messageApi.error(`会话删除失败: ${error.message}`);
			}
		},
		[deleteSessionFromGroup],
	);

	const updateWorkflowChatGroup = async (
		groupId: string,
		newGroup: Partial<WorkflowGroup>,
	) => {
		messageApi.open({
			content: "内容更新中",
			type: "loading",
		});

		const { description, topic, summary, updated_at, ...rest } = newGroup;

		const workflowGroupData = {
			user: userid,
			session_topic: topic,
			session_description: description,
			...rest,
		};

		try {
			const res = await updateWorkflowSession(workflowGroupData, groupId);

			if (res.code === 401) {
				throw new Error("登录状态已过期, 请重新登录");
			}
			messageApi.destroy();
			updateWorkflowGroup(groupId, newGroup); // 更新本地store

			messageApi.success("内容更新成功");
		} catch (error: any) {
			messageApi.error(`内容更新失败: ${error.message}`);
		}
	};

	const updateLocalWorkflowStoreHandler = (newData: any) => {
		// TODO: 本地store 方法还没做完
		newData.forEach(async (item: any) => {
			const groupId = item.id;
			const topic = item.topic;
			const lastUpdateTime = item.last_updated;
			const sessionIds = item.chat_sessions;
			let sessions: any = [];
			const existingGroup = workflowGroups.find(
				(group) => group.id === groupId,
			);

			if (!existingGroup) {
				console.log("workflowGroup", groupId);
				console.log("sessionIds", sessionIds);
			}

			if (sessionIds) {
				for (const session of sessionIds) {
					try {
						const res = await getSingleChatSession(session);
						sessions.push(res);
					} catch (error) {
						console.error("Error fetching chat session details:", error);
					}
				}
			}
			updateChatSessions(sessions);

			const newGroup = {
				id: groupId,
				topic: topic,
				lastUpdateTime: lastUpdateTime,
				sessions: sessionIds,
			};

			updateWorkflowGroup(groupId, newGroup);
		});
	};

	return (
		<WorkflowContext.Provider
			value={{
				workflowGroups,
				selectedId,
				setSelectedId,
				fetchNewWorkflowGroup,
				addWorkflowGroup: addWorkflowGroupHandler,
				deleteWorkflowGroup: deleteWorkflowGroupHandler,
				addChatGrouptoWorkflow: addChatGrouptoWorkflowHandler,
				moveSession: moveSessionHandler,
				deleteSessionFromGroup: deleteSessionFromGroupHandler,
				workflowSessions,
				workflowSessionsIndex,
				getworkFlowSessions,
				updateWorkflowChatGroup,
			}}
		>
			{contextHolder}
			{children}
		</WorkflowContext.Provider>
	);
};

// 自定义钩子
export const useWorkflowContext = () => {
	const context = useContext(WorkflowContext);
	if (context === null) {
		throw new Error(
			"useWorkflowContext must be used within a WorkflowProvider",
		);
	}
	return context;
};
