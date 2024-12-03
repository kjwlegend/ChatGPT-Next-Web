import { useCallback, useRef, useEffect } from "react";
import { useWorkflowStore } from "@/app/store/workflow";
import { message } from "antd";
import {
	createWorkflowSessionChatGroup,
	deleteWorkflowSessionChatGroup,
	updateWorkflowSessionChatGroupOrder,
	getWorkflowSessionChats,
} from "@/app/services/api/chats";
import { useUserStore } from "@/app/store";
import { Mask } from "@/app/types/mask";
import { createEmptySession } from "@/app/store/chat/utils";
import { useMaskStore } from "@/app/store/mask";

export const useWorkflowSessions = () => {
	const {
		workflowSessions,
		addSessionToGroup,
		moveSession,
		deleteSessionFromGroup,
		updateWorkflowSession,
	} = useWorkflowStore();

	const [messageApi, contextHolder] = message.useMessage();
	const userid = useUserStore((state) => state.user.id);
	const maskStore = useMaskStore();

	const workflowSessionsRef = useRef(workflowSessions);

	useEffect(() => {
		workflowSessionsRef.current = workflowSessions;
	}, [workflowSessions]);

	const addAgentToWorkflow = useCallback(
		async (agent: Mask, groupId: string) => {
			messageApi.loading("会话添加中");

			try {
				const apidata = {
					agent: agent.id,
					workflow_session: groupId,
				};
				const res = await createWorkflowSessionChatGroup(apidata, groupId);
				const newsession = createEmptySession({ id: res.id, mask: agent });
				addSessionToGroup(groupId, newsession);
				messageApi.success("会话添加成功");
			} catch (error: any) {
				messageApi.error(`会话添加失败: ${error.message}`);
				throw error;
			}
		},
		[addSessionToGroup, maskStore],
	);

	const moveWorkflowSession = useCallback(
		async (groupId: string, sourceIndex: number, destinationIndex: number) => {
			messageApi.loading("会话移动中");
			try {
				moveSession(groupId, sourceIndex, destinationIndex);
				const newSessions = workflowSessionsRef.current
					.filter((session) => session.workflow_group_id === groupId)
					.map((session) => ({
						id: session.id,
						order: session.order,
					}));

				const res = await updateWorkflowSessionChatGroupOrder(
					{
						chat_group_orders: newSessions,
						user: userid,
					},
					groupId,
				);

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}
				messageApi.success("会话移动成功");
			} catch (error: any) {
				messageApi.error(`会话移动失败: ${error.message}`);
				throw error;
			}
		},
		[moveSession, userid],
	);

	const deleteSession = useCallback(
		async (groupId: string, sessionId: string) => {
			messageApi.loading("会话删除中");
			try {
				deleteSessionFromGroup(groupId, sessionId);
				const res = await deleteWorkflowSessionChatGroup(
					{ chat_group_id: sessionId },
					groupId,
				);

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}
				messageApi.success("会话删除成功");
			} catch (error: any) {
				messageApi.error(`会话删除失败: ${error.message}`);
				throw error;
			}
		},
		[deleteSessionFromGroup],
	);

	const fetchSessionChats = useCallback(
		async (workflowGroupId: string) => {
			const chatGroupIds = workflowSessionsRef.current
				.filter((session) => session.workflow_group_id === workflowGroupId)
				.map((session) => session.id);

			const limit = 100;

			return Promise.all(
				chatGroupIds.map(async (sessionId) => {
					try {
						const res = await getWorkflowSessionChats(
							{
								chat_group_id: sessionId,
								limit,
							},
							workflowGroupId,
						);

						if (res.code === 401) {
							throw new Error("登录状态已过期");
						}

						// create a mapping to convert online res to local types
						const newMessages = res.chats.data.map((item: any) => ({
							...item,
							role: item.chat_role,
							model: item.chat_model,
							images: item.chat_images,
							date: item.created_at,
						}));

						updateWorkflowSession(workflowGroupId, sessionId, {
							messages: newMessages,
						});

						return res.chats.data;
					} catch (error: any) {
						console.error("Error fetching workflow chat session chats:", error);
						messageApi.error(`获取聊天记录失败: ${error.message}`);
						throw error;
					}
				}),
			);
		},
		[updateWorkflowSession],
	);

	return {
		workflowSessions: workflowSessionsRef.current,
		addAgentToWorkflow,
		moveWorkflowSession,
		deleteSession,
		fetchSessionChats,
		contextHolder,
	};
};
