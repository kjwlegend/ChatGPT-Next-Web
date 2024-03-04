import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatSession } from "./chat";
import { createWorkflowSession } from "../api/backend/chat";
import { useUserStore } from "./user";
import { nanoid } from "nanoid";

type State = {
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
	addWorkflowGroup: (userid: number, groupName: string) => void;
	deleteWorkflowGroup: (groupId: string) => void;
	addSessionToGroup: (groupId: string, session: ChatSession) => void;
	moveSession: (
		groupId: string,
		sourceIndex: number,
		destinationIndex: number,
	) => void;
	deleteSessionFromGroup: (groupId: string, sessionId: string) => void;
};
export const useWorkflowStore = create<State>()(
	persist(
		(set, get) => ({
			workflowGroup: {},
			selectedIndex: 0,
			setSelectedIndex: (index) => set({ selectedIndex: index }),
			addWorkflowGroup: async (userid, groupName) => {
				const res = await createWorkflowSession({
					user: userid,
					topic: groupName,
				});

				const groupId = res.data.id || nanoid();

				set((state) => ({
					workflowGroup: {
						...state.workflowGroup,
						[groupId]: {
							id: groupId,
							name: groupName,
							lastUpdateTime: new Date().toISOString(),
							sessions: [],
						},
					},
				}));
			},
			deleteWorkflowGroup: (groupId) =>
				set((state) => ({
					workflowGroup: Object.keys(state.workflowGroup)
						.filter((key) => key !== groupId)
						.reduce(
							(obj, key) => ({ ...obj, [key]: state.workflowGroup[key] }),
							{},
						),
				})),
			addSessionToGroup: (groupId, session) =>
				set((state) => ({
					workflowGroup: {
						...state.workflowGroup,
						[groupId]: {
							...state.workflowGroup[groupId],
							sessions: [...state.workflowGroup[groupId].sessions, session],
						},
					},
				})),
			moveSession: (groupId, sourceIndex, destinationIndex) =>
				set((state) => {
					const group = state.workflowGroup[groupId];
					const newSessions = [...group.sessions];
					const [removed] = newSessions.splice(sourceIndex, 1);
					newSessions.splice(destinationIndex, 0, removed);
					return {
						workflowGroup: {
							...state.workflowGroup,
							[groupId]: { ...group, sessions: newSessions },
						},
					};
				}),
			deleteSessionFromGroup: (groupId, sessionId) =>
				set((state) => {
					const group = state.workflowGroup[groupId];
					const newSessions = group.sessions.filter(
						(session) => session.id !== sessionId,
					);
					return {
						workflowGroup: {
							...state.workflowGroup,
							[groupId]: { ...group, sessions: newSessions },
						},
					};
				}),
		}),
		{
			name: "workflow-store",
		},
	),
);
