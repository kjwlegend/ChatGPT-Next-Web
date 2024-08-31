// TypeScript

import { useChatStore } from "@/app/store";
import { useWorkflowStore } from "@/app/store/workflow";
import { ChatSession, workflowChatSession } from "@/app/types/";
// 定义 ChatSession 和 WorkflowChatSession 类型

// 定义更新数据的类型
interface ChatUpdateData {
	sessionId: string;
	updates: Partial<ChatSession>;
	sync?: boolean;
}

interface WorkflowUpdateData {
	sessionId: string;
	groupId: string;
	updates: Partial<workflowChatSession> & { groupId: string };
}

// 定义高阶方法的类型
type UpdateType = "chat" | "workflow";
type UpdateData = ChatUpdateData | WorkflowUpdateData;

/**
 * Updates session configuration based on the update type and data provided.
 * @param {UpdateType} updateType - The type of update ('chat' or 'workflow').
 * @param {UpdateData} updateData - The data to update.
 */
export function sessionConfigUpdate(
	updateType: UpdateType,
	updateData: UpdateData,
): void {
	const chatStore = useChatStore.getState();
	const useworkflowStore = useWorkflowStore.getState();
	try {
		if (updateType === "chat") {
			const { sessionId, updates, sync } = updateData as ChatUpdateData;
			chatStore.updateSession(
				sessionId,
				(session: ChatSession) => {
					Object.assign(session, updates);
				},
				sync !== undefined ? sync : true,
			);
		} else if (updateType === "workflow") {
			const { sessionId, groupId, updates } = updateData as WorkflowUpdateData;
			const { ...workflowUpdates } = updates;
			console.log("workflowUpdates", workflowUpdates, updateData);
			useworkflowStore.updateWorkflowSession(
				groupId,
				sessionId,
				workflowUpdates,
			);
		} else {
			throw new Error('Invalid update type. Must be "chat" or "workflow".');
		}
	} catch (error) {
		console.error(
			"Failed to update session configuration:",
			(error as Error).message,
		);
	}
}
