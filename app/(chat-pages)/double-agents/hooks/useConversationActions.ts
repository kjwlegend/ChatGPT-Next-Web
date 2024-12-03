import { useCallback } from "react";
import { message } from "antd";
import { Mask } from "@/app/types/mask";
import {
	createMultipleAgentSession,
	updateMultiAgentSession,
} from "@/app/services/api/chats";
import { MULTI_AGENT_DEFAULT_TOPIC } from "@/app/store/multiagents/utils";
import { useUserStore } from "@/app/store/user";
import { useMultipleAgentStore } from "@/app/store/multiagents";

export const useConversationActions = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const userid = useUserStore.getState().user.id;

	const startNewConversation = useCallback(
		async (topic?: string) => {
			const hideLoading = messageApi.open({
				content: "对话创建中",
				type: "loading",
			});

			try {
				const data = {
					user: userid,
					session_topic: topic ?? MULTI_AGENT_DEFAULT_TOPIC,
					initialInput: "",
					agent_settings: [],
					totalRounds: 0,
					round: 0,
					pause: false,
				};

				const res = await createMultipleAgentSession(data);
				const store = useMultipleAgentStore.getState();

				store.startConversation(topic ?? MULTI_AGENT_DEFAULT_TOPIC, res.id, "");
				store.setCurrentConversationId(res.id);

				hideLoading();
				messageApi.success("对话创建成功");
			} catch (error) {
				hideLoading();
				messageApi.error("对话创建失败，请重试");
				console.error("对话创建失败:", error);
			}
		},
		[messageApi, userid],
	);

	const addAgent = useCallback(
		async (mask: Mask) => {
			const hideLoading = messageApi.open({
				content: "智能体创建中",
				type: "loading",
			});

			try {
				const store = useMultipleAgentStore.getState();
				const currentConversationId = store.currentConversationId;

				store.addAgent(currentConversationId, mask);

				const updatedSession = store.currentSession();
				if (!updatedSession) {
					throw new Error("当前会话不存在");
				}
				const aiconfigs = updatedSession.aiConfigs;

				await updateMultiAgentSession(
					{ custom_agents_data: aiconfigs },
					currentConversationId,
				);

				hideLoading();
				messageApi.success("智能体创建成功");
			} catch (error) {
				hideLoading();
				console.error("智能体创建失败:", error);
				messageApi.error("智能体创建失败，请重试");
			}
		},
		[messageApi],
	);

	const deleteAgent = useCallback(
		async (agentId: number) => {
			const hideLoading = messageApi.open({
				content: "正在删除智能体",
				type: "loading",
			});

			try {
				const store = useMultipleAgentStore.getState();
				const currentConversationId = store.currentConversationId;

				const currentSession = store.currentSession();
				if (!currentSession || currentSession.id !== currentConversationId) {
					throw new Error("当前会话已更改，请刷新页面后重试");
				}

				store.clearAIConfig(currentConversationId, agentId);
				const updatedAiConfigs = store.currentSession().aiConfigs;

				await updateMultiAgentSession(
					{ custom_agents_data: updatedAiConfigs },
					currentConversationId,
				);

				hideLoading();
				messageApi.success("智能体删除成功");
			} catch (error) {
				hideLoading();
				if (error instanceof Error) {
					messageApi.error(error.message);
				} else {
					messageApi.error("智能体删除失败，请重试");
				}
				console.error("智能体删除失败:", error);
			}
		},
		[messageApi],
	);

	const updateAgent = useCallback(
		async (agentId: number, updatedMask: Mask) => {
			const hideLoading = messageApi.open({
				content: "正在更新智能体",
				type: "loading",
			});

			try {
				const store = useMultipleAgentStore.getState();
				const currentConversationId = store.currentConversationId;

				const currentSession = store.currentSession();
				if (!currentSession || currentSession.id !== currentConversationId) {
					throw new Error("当前会话已更改，请刷新页面后重试");
				}

				store.setAIConfig(currentConversationId, agentId, updatedMask);

				const updatedSession = store.currentSession();
				if (!updatedSession) {
					throw new Error("当前会话不存在");
				}
				const updatedAiConfigs = updatedSession.aiConfigs;

				await updateMultiAgentSession(
					{ custom_agents_data: updatedAiConfigs },
					currentConversationId,
				);

				hideLoading();
				messageApi.success("智能体更新成功");
			} catch (error) {
				hideLoading();
				if (error instanceof Error) {
					messageApi.error(error.message);
				} else {
					messageApi.error("智能体更新失败，请重试");
				}
				console.error("智能体更新失败:", error);
			}
		},
		[messageApi],
	);

	return {
		startNewConversation,
		addAgent,
		deleteAgent,
		updateAgent,
		contextHolder,
	};
};
