import { useCallback } from "react";
import { message } from "antd";
import { useWorkflowStore } from "@/app/store/workflow";
import { useUserStore } from "@/app/store";
import {
	getWorkflowSession,
	createWorkflowSession,
	deleteWorkflowSession,
	updateWorkflowSession,
	getWorkflowSessionChats,
} from "@/app/services/api/chats";
import { WorkflowGroup } from "@/app/types/workflow";
import { ChatSession } from "@/app/types/chat";

interface WorkflowParams {
	limit?: number;
	page?: number;
}

export const useWorkflowActions = () => {
	const {
		workflowSessions,
		workflowSessionsIndex,
		updateWorkflowSession: updateLocalWorkflowSession,
		addSessionToGroup,
	} = useWorkflowStore();

	const [messageApi, contextHolder] = message.useMessage();
	const userid = useUserStore((state) => state.user.id);

	// 获取工作流会话列表
	const fetchWorkflowChatSessions = useCallback(
		async (newData: WorkflowGroup[]) => {
			messageApi.loading("工作流组更新中");
			console.log("debug fetchWorkflowChatSessions", newData);
			try {
				// 遍历每个工作流组
				for (const group of newData) {
					const currentWorkflowgroupId = group.id;
					const chatSessions = group.chat_groups || [];

					// 更新每个会话的信息
					for (const session of chatSessions) {
						const currentSessionId = session.id;
						const currentSession = workflowSessions.find(
							(s) => s.id === currentSessionId,
						);

						if (currentSession) {
							// 如果会话存在则更新
							const agentPrompts = {
								contexts: session.prompts,
							};
							updateLocalWorkflowSession(
								currentWorkflowgroupId,
								currentSessionId,
								agentPrompts,
							);
						} else {
							// 如果不存在则创建新会话
							// add new session

							const newSession = {
								id: session.id,
								session_id: session.session_id,
								workflow_group_id: currentWorkflowgroupId,
								order: session.order,
								isworkflow: true,
							};

							addSessionToGroup(currentWorkflowgroupId, {
								...newSession,
								topic: session.custom_agent_data.agent_name,
								memoryPrompt: "",
								messages: [],
								lastUpdateTime: Date.now(),
								lastSummarizeIndex: 0,
								mask: {
									id: session.agent,
									hideContext: true,
									avatar: session.custom_agent_data.image,
									name: session.custom_agent_data.agent_name,
									context: session.custom_agent_data.prompts_data,
									modelConfig: session.custom_agent_data.modelconfig,
									builtin: false,
									plugins: [],
									updatedAt: Date.now(),
									description: "",
									lang: "cn",
									createdAt: Date.now(),
									syncGlobalConfig: true,
								},
							});
						}
					}
				}
				messageApi.success("工作流组更新成功");
			} catch (error: any) {
				messageApi.error(`工作流组更新失败: ${error.message}`);
				throw error;
			}
		},
		[workflowSessions, updateLocalWorkflowSession],
	);

	// 加载更多会话
	const loadMoreSessions = useCallback(
		async (params: WorkflowParams) => {
			try {
				const res = await getWorkflowSession({
					user: userid,
					...params,
				});

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				return {
					data: res.data,
					is_next: res.is_next,
				};
			} catch (error: any) {
				messageApi.error(`加载更多会话失败: ${error.message}`);
				throw error;
			}
		},
		[userid],
	);

	return {
		fetchWorkflowChatSessions,
		loadMoreSessions,
		contextHolder,
	};
};
