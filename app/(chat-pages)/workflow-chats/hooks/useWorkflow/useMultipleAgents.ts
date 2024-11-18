import { useCallback, useState } from "react";
import { message } from "antd";
import { useUserStore } from "@/app/store";
import {
	getMultipleAgents,
	createMultipleAgent,
	deleteMultipleAgent,
	updateMultipleAgent,
} from "@/app/services/api/chats";

interface MultipleAgent {
	multiple_agent_id: string;
	multiple_agent_name: string;
	image?: string;
	language?: string;
	description?: string;
	active: boolean;
	multiple_agent_type: string;
	agents: string[];
	agents_num: number;
	agents_data?: any;
	use_count: number;
	tags?: string[];
	creator?: string;
	created_at: string;
	updated_at: string;
}

interface MultipleAgentParams {
	limit?: number;
	page?: number;
}

export const useMultipleAgents = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const [agents, setAgents] = useState<MultipleAgent[]>([]);
	const [loading, setLoading] = useState(false);
	const userid = useUserStore((state) => state.user.id);

	// 获取多智能体列表
	const fetchMultipleAgents = useCallback(
		async (params?: MultipleAgentParams) => {
			setLoading(true);
			try {
				const res = await getMultipleAgents({
					user: userid,
					...params,
				});

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				setAgents(res.data || []);
				return res;
			} catch (error: any) {
				messageApi.error(`获取多智能体列表失败: ${error.message}`);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[userid],
	);

	// 创建多智能体
	const createAgent = useCallback(
		async (data: Partial<MultipleAgent>) => {
			messageApi.loading("创建多智能体中");
			try {
				const res = await createMultipleAgent({
					user: userid,
					...data,
				});

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				messageApi.success("创建成功");
				// 刷新列表
				await fetchMultipleAgents();
				return res;
			} catch (error: any) {
				messageApi.error(`创建多智能体失败: ${error.message}`);
				throw error;
			}
		},
		[userid, fetchMultipleAgents],
	);

	// 更新多智能体
	const updateAgent = useCallback(
		async (id: string, data: Partial<MultipleAgent>) => {
			messageApi.loading("更新多智能体中");
			try {
				const res = await updateMultipleAgent(data, id);

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				messageApi.success("更新成功");
				// 更新本地状态
				setAgents((prev) =>
					prev.map((agent) =>
						agent.multiple_agent_id === id ? { ...agent, ...data } : agent,
					),
				);
				return res;
			} catch (error: any) {
				messageApi.error(`更新多智能体失败: ${error.message}`);
				throw error;
			}
		},
		[],
	);

	// 删除多智能体
	const deleteAgent = useCallback(async (id: string) => {
		messageApi.loading("删除多智能体中");
		try {
			const res = await deleteMultipleAgent({ active: false }, id);

			if (res.code === 401) {
				throw new Error("登录状态已过期");
			}

			messageApi.success("删除成功");
			// 更新本地状态
			setAgents((prev) =>
				prev.filter((agent) => agent.multiple_agent_id !== id),
			);
			return res;
		} catch (error: any) {
			messageApi.error(`删除多智能体失败: ${error.message}`);
			throw error;
		}
	}, []);

	return {
		agents,
		loading,
		fetchMultipleAgents,
		createAgent,
		updateAgent,
		deleteAgent,
		contextHolder,
	};
};
