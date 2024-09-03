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
import { useMaskStore } from "@/app/store/mask";

export const WORKFLOW_DEFAULT_TITLE = "未定义工作流";

interface WorkflowGroupActionsContextType {
	setSelectedId: (index: string) => void;
	getworkFlowSessions: (param: any) => Promise<any>;
	addWorkflowGroup: () => void;
	deleteWorkflowGroup: (groupId: number) => void;
	fetchNewWorkflowGroup: (data: Array<WorkflowGroup>) => void;
	addChatGrouptoWorkflow: (Mask: Mask, groupId?: string) => void;
	updateWorkflowSessionInfo: (
		groupId: string,
		newGroup: Partial<WorkflowGroup>,
	) => void;
}
interface workflowSessionActionsContextType {
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
	fetchWorkflowChatSessionsHandler: (param: any) => Promise<any>;
	fetchWorkflowChatSessionChatsHandler: (param: any) => Promise<any>;
}
interface WorkflowContextValue {
	selectedId: string;
	workflowGroups: Array<WorkflowGroup>;
}

export const workflowGroupsContext = createContext<WorkflowContextValue>({
	selectedId: "",
	workflowGroups: [],
});
export const workflowSessionsContext = createContext<sessionConfig[]>([]);
export const workflowGroupActionsContext =
	createContext<WorkflowGroupActionsContextType>({
		setSelectedId: () => {},
		getworkFlowSessions: () => Promise.resolve({}),
		addWorkflowGroup: () => {},
		deleteWorkflowGroup: () => {},
		fetchNewWorkflowGroup: () => {},
		addChatGrouptoWorkflow: () => {},
		updateWorkflowSessionInfo: () => {},
	});
export const workflowSessionActionsContext =
	createContext<workflowSessionActionsContextType>({
		moveSession: () => {},
		deleteSessionFromGroup: () => {},
		fetchWorkflowChatSessionsHandler: () => Promise.resolve({}),
		fetchWorkflowChatSessionChatsHandler: () => Promise.resolve({}),
	});
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
		updateWorkflowSession: updateLocalWorkflowSession,
	} = useWorkflowStore();

	const [messageApi, contextHolder] = message.useMessage();
	console.log("workflowcontext refresh", workflowSessions);

	const userid = useUserStore.getState().user.id;
	const maskStore = useMaskStore();

	const getworkFlowSessions = useCallback(async (param: any) => {
		messageApi.open({
			content: "工作流组获取中",
			type: "loading",
		});
		const data = {
			user: userid,
			...param,
		};

		const res = await getWorkflowSession(data);

		if (res.code === 401) {
			throw new Error("登录状态已过期, 请重新登录");
		}

		if (res.data) {
			fetchWorkflowChatSessionsHandler(res.data);
			messageApi.destroy();
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
		async (agent: Mask, groupId?: string) => {
			messageApi.open({
				content: "会话添加中",
				type: "loading",
			});

			try {
				const apidata = {
					agent: agent.id,
					workflow_session: groupId ?? selectedId,
				};
				console.log(apidata, "apidata");
				const mask = maskStore.get(agent.id);
				console.log(mask, "mask");
				const res = await createWorkflowSessionChatGroup(
					apidata,
					groupId ?? selectedId,
				);
				const newsession = createEmptySession({ id: res.id, mask });
				addSessionToGroup(groupId ?? selectedId, newsession);
				messageApi.destroy();
				messageApi.success("会话添加成功");
			} catch (error: any) {
				messageApi.error(`会话添加失败: ${error.message}`);
			}
		},
		[],
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

	const updateWorkflowSessionInfo = async (
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

	const fetchWorkflowChatSessionsHandler = async (newData: any) => {
		messageApi.open({
			content: "工作流组更新中",
			type: "loading",
		});
		console.log("newdata", newData);
		fetchNewWorkflowGroup(newData);
		//  上述步骤完成了 workflowgroup 的创建, 接下来要更新 workflowsession
		//  首先判断当前的session 是否存在, 如果存在则更新, 如果不存在则创建

		newData.map((group) => {
			const currentWorkflowgroupId = group.id;
			const chatsessions = group.chat_groups;

			chatsessions.map((session) => {
				const currentSessionId = session.id;
				const currentSession = useWorkflowStore
					.getState()
					.workflowSessions.find((session) => session.id === currentSessionId);
				if (currentSession) {
					const agentPrompts = {
						contexts: session.prompts,
					};
					updateLocalWorkflowSession(
						currentWorkflowgroupId,
						currentSessionId,
						agentPrompts,
					);
				} else {
					// 如果不存在则采用addSessionToGroup 新建
					const agent = useMaskStore.getState().masks[session.agent] as Mask;
					const newsession = createEmptySession({
						id: currentSessionId,
						mask: agent,
					});
					addSessionToGroup(currentWorkflowgroupId, newsession);
				}
			});
		});
	};

	const fetchWorkflowChatSessionChatsHandler = useCallback(
		async (workflow_group_id: string) => {
			const chatGroupids =
				useWorkflowStore.getState().workflowSessionsIndex[workflow_group_id] ||
				[];
			console.log(chatGroupids, "chatGroupids");

			const limit = 100;
			chatGroupids.map(async (sessionId) => {
				console.log(sessionId, "sessionId");
				try {
					const res = await getWorkflowSessionChats(
						{
							chat_group_id: sessionId,
							limit,
						},
						workflow_group_id,
					);
					const chats = res.chats.data;

					updateLocalWorkflowSession(workflow_group_id, sessionId, {
						messages: chats,
					});

					if (res.code === 401) {
						throw new Error("登录状态已过期, 请重新登录");
					}
				} catch (error) {
					console.error("Error fetching workflow chat session chats:", error);
				}
			});
		},
		[
			workflowSessionsIndex,
			getWorkflowSessionChats,
			updateLocalWorkflowSession,
		],
	);

	return (
		<workflowSessionActionsContext.Provider
			value={{
				moveSession: moveSessionHandler,
				deleteSessionFromGroup: deleteSessionFromGroupHandler,
				fetchWorkflowChatSessionsHandler,
				fetchWorkflowChatSessionChatsHandler,
			}}
		>
			<workflowGroupActionsContext.Provider
				value={{
					setSelectedId,
					fetchNewWorkflowGroup,
					getworkFlowSessions,
					addWorkflowGroup: addWorkflowGroupHandler,
					deleteWorkflowGroup: deleteWorkflowGroupHandler,
					addChatGrouptoWorkflow: addChatGrouptoWorkflowHandler,
					updateWorkflowSessionInfo,
				}}
			>
				<workflowSessionsContext.Provider value={workflowSessions}>
					<workflowGroupsContext.Provider
						value={{ selectedId, workflowGroups }}
					>
						{contextHolder}
						{children}
					</workflowGroupsContext.Provider>
				</workflowSessionsContext.Provider>
			</workflowGroupActionsContext.Provider>
		</workflowSessionActionsContext.Provider>
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

export const useWorkflowGroupActions = () => {
	const context = useContext(workflowGroupActionsContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowGroupActions must be used within a WorkflowProvider",
		);
	}
	return context;
};

export const useWorkflowSessionActions = () => {
	const context = useContext(workflowSessionActionsContext);
	if (context === undefined) {
		throw new Error(
			"useWorkflowSessionActions must be used within a WorkflowProvider",
		);
	}
	return context;
};

export default WorkflowProvider;
