import { useState, useEffect, useCallback } from "react";
import { useWorkflowStore } from "@/app/store/workflow";
import { useWorkflowGroups } from "./useWorkflow/useWorkflowGroups";
import { useWorkflowSessions } from "./useWorkflow/useWorkflowSessions";
import { useWorkflowActions } from "./useWorkflow/useWorkflowActions";
import { useWorkflowInteractions } from "./useWorkflow/useWorkflowInteractions";

export const useSimpleWorkflowService = () => {
	// 获取各个 hooks 的功能
	const { workflowGroups } = useWorkflowGroups();
	const { workflowSessions } = useWorkflowSessions();
	const { loadMoreSessions } = useWorkflowActions();
	const {
		handleChatItemClick,
		handleAddClick,
		handleItemDelete: handleChatItemDelete,
		handleAgentClick,
		handleItemEditClick,
	} = useWorkflowInteractions();

	// 保持与原有接口兼容的数据结构
	const [WorkflowGroupData, setWorkflowGroupData] =
		useState<any[]>(workflowGroups);

	useEffect(() => {
		setWorkflowGroupData(workflowGroups);
	}, [workflowGroups]);

	return {
		// 保持原有的导出接口
		WorkflowGroupData,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
		handleAgentClick,
		handleItemEditClick,

		// 可选: 导出新的功能接口，供后续使用
		workflowSessions,
		workflowGroups,
	};
};

// 为了向后兼容，保持原有的默认导出
export default useSimpleWorkflowService;
