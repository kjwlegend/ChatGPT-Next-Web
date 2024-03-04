import React, { createContext, useContext, useState, useCallback } from "react";
import { useWorkflowStore } from "../store/workflow";
import { ChatSession, useUserStore } from "../store";
import { message } from "antd";

const WORKFLOW_DEFAULT_TITLE = "未定义工作流";

// 定义WorkflowContext接口
interface WorkflowContextType {
	workflowGroup: {
		[groupId: string]: {
			id: string;
			name: string;
			lastUpdateTime: string;
			sessions: ChatSession[];
		};
	};
	selectedIndex: number;
	setSelectedIndex: (index: number) => void;
	addWorkflowGroup: () => void;
	deleteWorkflowGroup: (groupId: string) => void;
	addSessionToGroup: (groupId: string, session: ChatSession) => void;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
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
		selectedIndex,
		setSelectedIndex,
		addWorkflowGroup,
		deleteWorkflowGroup,
		addSessionToGroup,
		moveSession,
		deleteSessionFromGroup,
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
			await addWorkflowGroup(userid, WORKFLOW_DEFAULT_TITLE);
			messageApi.destroy();
			messageApi.success("工作流组创建成功");
		} catch (error: any) {
			messageApi.error(`工作流组创建失败: ${error.message}`);
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
		async (groupId: string, session: ChatSession) => {
			messageApi.open({
				content: "会话添加中",
				type: "loading",
			});
			try {
				await addSessionToGroup(groupId, session);
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
				await moveSession(groupId, sourceIndex, destinationIndex);
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
				await deleteSessionFromGroup(groupId, sessionId);
				messageApi.success("会话删除成功");
			} catch (error: any) {
				messageApi.error(`会话删除失败: ${error.message}`);
			}
		},
		[deleteSessionFromGroup],
	);
	// 提供上下文值
	return (
		<WorkflowContext.Provider
			value={{
				workflowGroup,
				selectedIndex,
				setSelectedIndex,
				addWorkflowGroup: addWorkflowGroupHandler,
				deleteWorkflowGroup: deleteWorkflowGroupHandler,
				addSessionToGroup: addSessionToGroupHandler,
				moveSession: moveSessionHandler,
				deleteSessionFromGroup: deleteSessionFromGroupHandler,
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
