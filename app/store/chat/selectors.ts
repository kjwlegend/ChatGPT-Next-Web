import { ChatState } from "./types";
import { ChatSession } from "../../types/chat";

export const selectSessions = (state: ChatState) => state.sessions;

export const selectSessionById = (state: ChatState, id: string) =>
	state.sessions[id];

export const selectAllSessions = (state: ChatState) =>
	Object.values(state.sessions || {}).sort((a, b) => {
		const timeA = b?.lastUpdateTime || 0;
		const timeB = a?.lastUpdateTime || 0;
		return timeA - timeB;
	});

export const selectCurrentSession = (state: ChatState) =>
	state.currentSessionId ? state.sessions[state.currentSessionId] : undefined;

export const selectSessionByIndex = (state: ChatState, index: number) => {
	const sessions = Object.values(state.sessions);
	return sessions[index];
};

export const selectCurrentSessionIndex = (state: ChatState) => {
	const sessions = Object.values(state.sessions);
	return sessions.findIndex((s) => s.id === state.currentSessionId);
};
export const selectSessionMessages = (state: ChatState, sessionId: string) => {
	// console.log("state.sessions: ", state.sessions);
	return state.sessions[sessionId]?.messages || [];
};

export const selectSessionCount = (state: ChatState) =>
	Object.keys(state.sessions).length;

export const selectMessageCount = (state: ChatState, sessionId: string) =>
	state.sessions[sessionId]?.messages.length || 0;

export const selectSortedSessions = (state: ChatState) =>
	Object.values(state.sessions).sort(
		(a, b) => b.lastUpdateTime - a.lastUpdateTime,
	);

export const selectActiveSessions = (state: ChatState) =>
	Object.values(state.sessions).filter((session) => !session.isworkflow);

export const selectWorkflowSessions = (state: ChatState) =>
	Object.values(state.sessions).filter((session) => session.isworkflow);
