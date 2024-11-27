import { createPersistStore } from "../../utils/store";
import { DEFAULT_CHAT_STATE } from "./initialState";
import { ChatState, ChatStore, ChatSelectors, ChatActions } from "./types";
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
		const actions: ChatActions = createChatActions(set, get);
		const selectors: ChatSelectors = Object.keys(selectorsModule).reduce(
			(acc, key) => {
				acc[key as keyof ChatSelectors] = (...args: any[]) =>
					(selectorsModule[key as keyof Selectors] as any)(get(), ...args);
				return acc;
			},
			{} as ChatSelectors,
		);

		return {
			...DEFAULT_CHAT_STATE,
			...actions,
			...selectors,
		};
	},
	{
		name: StoreKey.Chat,
		version: 3.9,
		migrate: (persistedState: unknown, version: number) => {
			const state = persistedState as any;
			const newState = JSON.parse(JSON.stringify(state)) as ChatState;

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
			//  更新了initialstate

			return newState as any;
		},
	},
);

// console.log("selectors", selectorsModule);
// console.log("useChatStore", useChatStore);

export * from "./types";
export { selectorsModule as selectors };
