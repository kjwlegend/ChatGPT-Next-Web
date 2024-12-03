import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MultiAgentState, MultiAgentStore } from "./types";
import { createMultiAgentActions } from "./actions";
import { createMultiAgentSelectors } from "./selectors";

export const MULTI_AGENT_DEFAULT_TOPIC = "多智能体对话";

const initialState: MultiAgentState = {
	currentConversationId: "",
	conversations: [],
};

export const useMultipleAgentStore = create<MultiAgentStore>()(
	persist(
		(set, get) => ({
			...initialState,
			...createMultiAgentActions(set, get),
			...createMultiAgentSelectors(get),
		}),
		{
			name: "double-agent-storage",
			version: 1.0,
			migrate: (persistedState, version) => {
				if (version < 1.0) {
					console.log("Clearing storage due to version mismatch");
					return initialState;
				}
				return persistedState;
			},
		},
	),
);

// Error handling for persistence
useMultipleAgentStore.subscribe((state) => {
	try {
		localStorage.setItem("double-agent-storage", JSON.stringify(state));
	} catch (error) {
		console.error("Failed to persist state:", error);
	}
});
