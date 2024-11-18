import { useCallback } from "react";
import { useWorkflowStore } from "@/app/store/workflow";
import { message } from "antd";
import { useUserStore } from "@/app/store";
import {
	getWorkflowSession,
	createWorkflowSession,
	deleteWorkflowSession,
	updateWorkflowSession,
} from "@/app/services/api/chats";
import { WORKFLOW_DEFAULT_TITLE } from "../../constants";
import type { WorkflowGroup } from "@/app/types/workflow";
import { useWorkflowActions } from "./useWorkflowActions";

interface CreateWorkflowParams {
	multiple_agents?: string;
	session_topic?: string;
}

export const useWorkflowGroups = () => {
	const {
		workflowGroups,
		selectedId,
		setSelectedId,
		addWorkflowGroup,
		updateWorkflowGroup,
		deleteWorkflowGroup,
		fetchNewWorkflowGroup,
	} = useWorkflowStore();

	const { fetchWorkflowChatSessions } = useWorkflowActions();

	const userid = useUserStore((state) => state.user.id);
	const currentGroup = workflowGroups.find((group) => group.id === selectedId);

	const createWorkflowGroup = useCallback(
		async (params?: CreateWorkflowParams) => {
			const hide = message.loading("工作流组创建中", 0);
			try {
				const res = await createWorkflowSession({
					user: userid,
					session_topic: params?.session_topic || WORKFLOW_DEFAULT_TITLE,
					multiple_agents: params?.multiple_agents,
				});

				if (res.id) {
					addWorkflowGroup(
						res.id,
						params?.session_topic || WORKFLOW_DEFAULT_TITLE,
					);
					hide();

					fetchWorkflowChatSessions([res]);
					message.success("工作流组创建成功");


				
					return res.id;
				}

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}
			} catch (error: any) {
				hide();
				message.error(`工作流组创建失败: ${error.message}`);
				throw error;
			}
		},
		[addWorkflowGroup, userid],
	);

	const deleteWorkflowGroupById = useCallback(
		async (groupId: number) => {
			const hide = message.loading("工作流组删除中", 0);
			try {
				const res = await deleteWorkflowSession({ active: false }, groupId);

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				deleteWorkflowGroup(groupId);
				hide();
				message.success("工作流组删除成功");
			} catch (error: any) {
				hide();
				message.error(`工作流组删除失败: ${error.message}`);
				throw error;
			}
		},
		[deleteWorkflowGroup],
	);

	const updateWorkflowGroupInfo = useCallback(
		async (groupId: string, updates: Partial<WorkflowGroup>) => {
			const hide = message.loading("工作流组更新中", 0);
			try {
				const { topic, description, updated_at, ...rest } = updates;

				const workflowGroupData = {
					user: userid,
					session_topic: topic,
					session_description: description,
					...rest,
				};

				const res = await updateWorkflowSession(workflowGroupData, groupId);

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				updateWorkflowGroup(groupId, updates);
				hide();
				message.success("工作流组更新成功");
			} catch (error: any) {
				hide();
				message.error(`工作流组更新失败: ${error.message}`);
				throw error;
			}
		},
		[updateWorkflowGroup, userid],
	);

	const fetchWorkflowGroups = useCallback(
		async (params: { limit: number; page: number }) => {
			const hide = message.loading("工作流组获取中", 0);
			try {
				const res = await getWorkflowSession({
					user: userid,
					...params,
				});

				if (res.code === 401) {
					throw new Error("登录状态已过期");
				}

				if (res.data) {
					fetchNewWorkflowGroup(res.data);
					hide();
					message.success("工作流组获取成功");
				}

				return res;
			} catch (error: any) {
				hide();
				message.error(`工作流组获取失败: ${error.message}`);
				throw error;
			}
		},
		[fetchNewWorkflowGroup, userid],
	);

	return {
		workflowGroups,
		selectedId,
		currentGroup,
		setSelectedId,
		createWorkflowGroup,
		deleteWorkflowGroupById,
		updateWorkflowGroupInfo,
		fetchWorkflowGroups,
	};
};
