import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkflowGroups } from "./useWorkflowGroups";
import { useWorkflowSessions } from "./useWorkflowSessions";
import { useWorkflowActions } from "./useWorkflowActions";
import { Mask } from "@/app/types/mask";
import { Path } from "@/app/constant";
import { WorkflowGroup } from "@/app/types/workflow";

export const useWorkflowInteractions = () => {
	const router = useRouter();
	const {
		setSelectedId,
		createWorkflowGroup,
		deleteWorkflowGroupById,
		updateWorkflowGroupInfo,
		selectedId,
	} = useWorkflowGroups();
	const { addAgentToWorkflow, fetchSessionChats } = useWorkflowSessions();

	// 处理点击工作流组
	const handleChatItemClick = useCallback(
		async (id: string) => {
			try {
				setSelectedId(id);
				await fetchSessionChats(id);
				//   router.push(Path.Chat);
			} catch (error) {
				console.error("Error handling chat item click:", error);
			}
		},
		[setSelectedId, fetchSessionChats],
	);

	// 处理添加新工作流组
	const handleAddClick = useCallback(async () => {
		try {
			await createWorkflowGroup();
		} catch (error) {
			console.error("Error handling add click:", error);
		}
	}, [createWorkflowGroup]);

	// 处理删除工作流组
	const handleItemDelete = useCallback(
		async (id: number) => {
			try {
				await deleteWorkflowGroupById(id);
			} catch (error) {
				console.error("Error handling delete:", error);
			}
		},
		[deleteWorkflowGroupById],
	);

	// 处理添加 Agent 到工作流
	const handleAgentClick = useCallback(
		async (agent: Mask) => {
			if (!selectedId) return;

			try {
				await addAgentToWorkflow(agent, selectedId);
				await fetchSessionChats(selectedId);
			} catch (error) {
				console.error("Error handling agent click:", error);
			}
		},
		[addAgentToWorkflow, fetchSessionChats, selectedId],
	);

	// 处理编辑工作流组
	const handleItemEditClick = useCallback(
		async (groupId: string, updates: Partial<WorkflowGroup>) => {
			try {
				await updateWorkflowGroupInfo(groupId, updates);
			} catch (error) {
				console.error("Error handling edit:", error);
			}
		},
		[updateWorkflowGroupInfo],
	);

	return {
		handleChatItemClick,
		handleAddClick,
		handleItemDelete,
		handleAgentClick,
		handleItemEditClick,
	};
};
