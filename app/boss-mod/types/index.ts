export interface ActionNode {
	id: string;
	taskId: string; // 关联的任务ID
	taskContent: string; // 任务内容
	status: "running" | "completed" | "failed";
	timestamp: string;
	steps: ActionStep[]; // 执行步骤
}

export interface ActionStep {
	id: string;
	type: ActionType;
	content: string;
	timestamp: string;
	status: "running" | "completed" | "failed";
	metadata?: {
		llmResponse?: {
			thought?: string;
			reasoning?: string;
			criticism?: string;
			plan?: string;
		};
		functionCall?: {
			name: string;
			arguments: Record<string, any>;
			result?: any;
		};
		toolName?: string;
		memoryId?: string;
		result?: string;
		error?: string;
	};
}

export interface ThoughtNode {
	id: string;
	content: string;
	type: "thought" | "task" | "task_group" | "conclusion";
	timestamp: string;
	status?: "pending" | "approved" | "rejected";
	parentId?: string;
	children?: ThoughtNode[];
	metadata?: {
		estimatedTime?: string;
		priority?: number;
	};
}

export interface TaskGroup {
	id: string;
	title: string;
	description: string;
	status: "pending" | "approved" | "in_progress" | "completed";
	priority: number;
	estimatedTime?: string;
	tasks: Task[];
	createdAt: string;
	updatedAt: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status: "pending" | "approved" | "in_progress" | "completed" | "blocked";
	priority: number;
	estimatedTime?: string;
	groupId: string;
	dependencies: string[];
	subTasks?: Task[];
}

export interface ThinkingSession {
	id: string;
	goal: string;
	status: "thinking" | "paused" | "completed";
	thoughts: ThoughtNode[];
	currentTaskGroup?: TaskGroup;
}

export const TASK_GROUP_TYPES = [
	{ value: "feature", label: "能开发" },
	{ value: "bug", label: "问题修复" },
	{ value: "optimization", label: "性能优化" },
	{ value: "research", label: "技术调研" },
] as const;

export type TaskGroupType = (typeof TASK_GROUP_TYPES)[number]["value"];

export type ActionType =
	| "execute" // 普通执行
	| "replan" // 重新规划
	| "use_tool" // 调用工具
	| "save_memory" // 保存记忆
	| "evaluate" // 评估成果
	| "output"; // 输出成果
