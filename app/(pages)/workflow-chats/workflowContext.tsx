"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useWorkflowStore } from "../../store/workflow";
import { useUserStore } from "../../store";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { message } from "antd";

import {
	createWorkflowSession,
	deleteWorkflowSession,
	getSingleChatSession,
	getWorkflowSession,
	updateWorkflowSession,
} from "../../api/backend/chat";
import { group } from "console";
import { updateChatSessions } from "../../services/chatService";

export const WORKFLOW_DEFAULT_TITLE = "未定义工作流";

// 定义WorkflowContext接口
interface WorkflowContextType {
	workflowGroup: {
		[groupId: string]: {
			id: string;
			topic: string;
			lastUpdateTime: string;
			sessions: string[];
		};
	};
	selectedId: string;
	setselectedId: (index: string) => void;
	addWorkflowGroup: () => void;
	deleteWorkflowGroup: (groupId: string) => void;
	addSessionToGroup: (groupId: string, session: string) => void;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	getworkFlowSessions: (param: any) => Promise<any>;
	updateSingleWorkflowGroup: (groupId: string, newGroup: any) => void;
}

// 创建上下文
export const WorkflowContext = createContext<WorkflowContextType | null>(null);

// WorkflowProvider组件
export const WorkflowProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const {
		workflowGroup,
		selectedId,
		setselectedId,
		addWorkflowGroup,
		updateWorkflowGroup,
		deleteWorkflowGroup,
		addSessionToGroup,
		moveSession,
		deleteSessionFromGroup,
		getWorkflowSessionId,
	} = useWorkflowStore();

	const [messageApi, contextHolder] = message.useMessage();

	const userid = useUserStore.getState().user.id;
	// 添加工作流的处理函数
	const addWorkflowGroupHandler = useCallback(async () => {
		messageApi.open({
			content: "工作流组创建中",
			type: "loading",
		});
		try {
			const res = await createWorkflowSession({
				user: userid,
				topic: WORKFLOW_DEFAULT_TITLE,
			});

			if (res.code === 401) {
				throw new Error("登录状态已过期, 请重新登录");
			}

			await addWorkflowGroup(res.data.id, WORKFLOW_DEFAULT_TITLE);
			messageApi.destroy();
			messageApi.success("工作流组创建成功");
		} catch (error: any) {
			messageApi.error(`工作流组创建失败: ${error}`);
		}
	}, [addWorkflowGroup]);
	// 删除工作流的处理函数
	const deleteWorkflowGroupHandler = useCallback(
		async (groupId: string) => {
			messageApi.open({
				content: "工作流组删除中",
				type: "loading",
			});
			try {
				const res = await deleteWorkflowSession(groupId);
				if (res.code === 401) {
					throw new Error("登录状态已过期, 请重新登录");
				}

				await deleteWorkflowGroup(groupId);
				messageApi.destroy();
				messageApi.success("工作流组删除成功");
			} catch (error: any) {
				messageApi.error(`工作流组删除失败: ${error.message}`);
			}
		},
		[deleteWorkflowGroup],
	);
	// 添加会话到工作流的处理函数
	const addSessionToGroupHandler = useCallback(
		async (groupId: string, session: string) => {
			messageApi.open({
				content: "会话添加中",
				type: "loading",
			});
			try {
				await addSessionToGroup(groupId, session);
				messageApi.destroy();
				messageApi.success("会话添加成功");
			} catch (error: any) {
				messageApi.error(`会话添加失败: ${error.message}`);
			}
		},
		[addSessionToGroup],
	);
	// 移动会话的处理函数
	const moveSessionHandler = useCallback(
		async (groupId: string, sourceIndex: number, destinationIndex: number) => {
			messageApi.open({
				content: "会话移动中",
				type: "loading",
			});
			try {
				moveSession(groupId, sourceIndex, destinationIndex);
				const newSessions = getWorkflowSessionId(groupId);
				const res = await updateWorkflowSession(groupId, {
					chat_sessions: newSessions,
					user: userid,
				});
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
	// 从工作流中删除会话的处理函数
	const deleteSessionFromGroupHandler = useCallback(
		async (groupId: string, sessionId: string) => {
			messageApi.open({
				content: "会话删除中",
				type: "loading",
			});
			try {
				deleteSessionFromGroup(groupId, sessionId);
				const newSessions = getWorkflowSessionId(groupId);
				const res = await updateWorkflowSession(groupId, {
					chat_sessions: newSessions,
					user: userid,
				});
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

	// 获取工作流会话的处理函数
	const getworkFlowSessions = useCallback(async (param: any) => {
		const data = {
			user: userid,
			...param,
		};

		const res = await getWorkflowSession(data);

		if (res.code === 401) {
			throw new Error("登录状态已过期, 请重新登录");
		}

		// 更新workflowGroup
		if (res.data) {
			updateWorkflowGroupHandler(res.data);
		}

		return res;
	}, []);

	const updateSingleWorkflowGroup = async (groupId: string, newGroup: any) => {
		//  including messageapi and updateworkflowsession

		// 更新workflowGroup

		messageApi.open({
			content: "内容更新中",
			type: "loading",
		});

		const { chat_sessions, topic, ...rest } = newGroup;

		const workflowGroupData = {
			user: userid,
			chat_sessions: chat_sessions,
			topic: topic,
			...rest,
		};

		try {
			const res = await updateWorkflowSession(groupId, workflowGroupData);

			if (res.code === 401) {
				throw new Error("登录状态已过期, 请重新登录");
			}
			messageApi.destroy();
			updateWorkflowGroup(groupId, workflowGroupData);

			messageApi.success("内容更新成功");
		} catch (error: any) {
			messageApi.error(`内容更新失败: ${error.message}`);
		}
	};

	const updateWorkflowGroupHandler = (newData: any) => {
		// 更新workflowGroup

		// 遍历新的数据，更新workflowGroup
		newData.forEach(async (item: any) => {
			const groupId = item.id; // 假设item.id是workflowGroup的key
			const topic = item.topic; // 假设item.topic是workflowGroup中group的名字
			const lastUpdateTime = item.last_updated;
			const sessionIds = item.chat_sessions;
			let sessions: any = [];
			if (!workflowGroup[groupId]) {
				// 如果workflowGroup中没有这个groupId，则创建一个新的group
				console.log("workflowGroup", groupId);
				console.log("sessionIds", sessionIds);
			}

			// 遍历 sessions ,通过 getSingleChatSession 获取会话的详细信息

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
			//  更新会话到chatstore
			updateChatSessions(sessions);

			// 更新workflowGroup

			const newGroup = {
				id: groupId,
				topic: topic,
				lastUpdateTime: lastUpdateTime,
				sessions: sessionIds,
			};

			updateWorkflowGroup(groupId, newGroup);
		});
	};

	// 提供上下文值
	return (
		<WorkflowContext.Provider
			value={{
				workflowGroup,
				selectedId,
				setselectedId,
				addWorkflowGroup: addWorkflowGroupHandler,
				deleteWorkflowGroup: deleteWorkflowGroupHandler,
				addSessionToGroup: addSessionToGroupHandler,
				moveSession: moveSessionHandler,
				deleteSessionFromGroup: deleteSessionFromGroupHandler,
				getworkFlowSessions: getworkFlowSessions,
				updateSingleWorkflowGroup,
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
