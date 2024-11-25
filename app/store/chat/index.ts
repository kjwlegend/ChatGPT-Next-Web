import { createPersistStore } from "../../utils/store";
import { DEFAULT_CHAT_STATE } from "./initialState";
import { ChatState, ChatStore, ChatSelectors } from "./types";
import { createChatActions } from "./actions";
import * as selectorsModule from "./selectors";
import { StoreKey } from "../../constant";
import { nanoid } from "nanoid";
import { createEmptySession } from "./utils";
import { ChatSession } from "@/app/types/chat";
import { useAppConfig } from "../config";

type Selectors = typeof selectorsModule;

export const useChatStore = createPersistStore<ChatState, ChatStore>(
	DEFAULT_CHAT_STATE,
	(set, get) => {
		const actions = createChatActions(set, get);
		const selectors: ChatSelectors = Object.keys(selectorsModule).reduce(
			(acc, key) => {
				acc[key as keyof ChatSelectors] = (...args: any[]) =>
					(selectorsModule[key as keyof Selectors] as any)(get(), ...args);
				return acc;
			},
			{} as ChatSelectors,
		);

		console.log("selectors original", selectors);

		return {
			...DEFAULT_CHAT_STATE,
			...actions,
			...selectors,
		};
	},
	{
		name: StoreKey.Chat,
		version: 3.8,
		migrate: (persistedState: unknown, version: number) => {
			const state = persistedState as any;
			const newState = JSON.parse(JSON.stringify(state)) as ChatState;

			if (version < 2) {
				// Convert array-based sessions to record-based
				const oldSessions = state.sessions as ChatSession[];
				newState.sessions = {};
				oldSessions.forEach((oldSession) => {
					const newSession = createEmptySession();
					newSession.topic = oldSession.topic;
					newSession.messages = [...oldSession.messages];
					newSession.mask.modelConfig.sendMemory = true;
					newSession.mask.modelConfig.historyMessageCount = 4;
					newSession.mask.modelConfig.compressMessageLengthThreshold = 1000;
					newState.sessions[newSession.id] = newSession;
				});
			}

			if (version < 3) {
				// Migrate id to nanoid
				Object.values(newState.sessions).forEach((s) => {
					if (!s.id) s.id = nanoid();
					s.messages.forEach((m) => {
						if (!m.id) m.id = nanoid();
						m.nanoid = m.id;
					});
				});
			}

			if (version < 3.1) {
				// Enable `enableInjectSystemPrompts` attribute for old sessions
				Object.values(newState.sessions).forEach((s) => {
					if (!s.mask.modelConfig.hasOwnProperty("enableInjectSystemPrompts")) {
						const config = useAppConfig.getState();
						s.mask.modelConfig.enableInjectSystemPrompts =
							config.modelConfig.enableInjectSystemPrompts;
					}
				});
			}

			if (version < 3.2) {
				// Add workflow and MJ related fields
				Object.values(newState.sessions).forEach((s) => {
					s.isworkflow = false;
					s.mjConfig = {
						size: "",
						quality: "",
						stylize: "",
						model: "",
					};
				});
			}

			if (version < 3.4) {
				// Add new model config options
				Object.values(newState.sessions).forEach((s) => {
					s.mask.modelConfig.enableRelatedQuestions = false;
					s.mask.modelConfig.enableUserInfos = true;
				});
			}

			if (version < 3.7) {
				// Add plugins
				Object.values(newState.sessions).forEach((s) => {
					s.mask.plugins = ["web-search"];
				});
			}

			if (version < 3.8) {
				// Convert sessions array to record and update currentSessionIndex to currentSessionId
				if (Array.isArray(newState.sessions)) {
					const sessionsRecord: Record<string, ChatSession> = {};
					newState.sessions.forEach((session: ChatSession) => {
						sessionsRecord[session.id] = session;
					});
					newState.sessions = sessionsRecord;
				}

				// Convert currentSessionIndex to currentSessionId
				if (typeof (state as any).currentSessionIndex === "number") {
					const sessions = Object.values(newState.sessions);
					const index = (state as any).currentSessionIndex;
					newState.currentSessionId = sessions[index]?.id ?? null;
				}
			}

			return newState as any;
		},
	},
);

// console.log("selectors", selectorsModule);
// console.log("useChatStore", useChatStore);

export * from "./types";
export { selectorsModule as selectors };
