import {
	ApiPath,
	DEFAULT_API_HOST,
	ServiceProvider,
	StoreKey,
} from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { useAuthStore } from "./auth";
import { createPersistStore } from "../utils/store";
import { ensure } from "../utils/clone";

// export interface AccessControlStore {
//   accessCode: string;
//   token: string;

//   needCode: boolean;
//   hideUserApiKey: boolean;
//   hideBalanceQuery: boolean;
//   disableGPT4: boolean;

//   openaiUrl: string;

//   updateToken: (_: string) => void;
//   updateCode: (_: string) => void;
//   updateOpenAiUrl: (_: string) => void;
//   enabledAccessControl: () => boolean;
//   isAuthorized: (isAuthenticated: boolean) => boolean;
//   fetch: () => void;
// }

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
	getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : ApiPath.OpenAI;

const DEFAULT_ACCESS_STATE = {
	accessCode: "",
	useCustomConfig: false,

	provider: ServiceProvider.OpenAI,

	// openai
	openaiUrl: DEFAULT_OPENAI_URL,
	openaiApiKey: "",

	// azure
	azureUrl: "",
	azureApiKey: "",
	azureApiVersion: "2023-08-01-preview",

	// server config
	needCode: true,
	hideUserApiKey: false,
	hideBalanceQuery: false,
	disableGPT4: false,
	disableFastLink: false,
	customModels: "",
};

export const useAccessStore = createPersistStore(
	{ ...DEFAULT_ACCESS_STATE },

	(set, get) => ({
		enabledAccessControl() {
			this.fetch();

			return get().needCode;
		},

		isValidOpenAI() {
			return ensure(get(), ["openaiUrl", "openaiApiKey"]);
		},

		isValidAzure() {
			return ensure(get(), ["azureUrl", "azureApiKey", "azureApiVersion"]);
		},
		updateOpenAiUrl(url: string) {
			set(() => ({ openaiUrl: url?.trim() }));
		},
		isAuthorized(isAuthenticated: boolean) {
			this.fetch();

			// has token or has code or disabled access control
			return (
				this.isValidOpenAI() ||
				this.isValidAzure() ||
				!this.enabledAccessControl() ||
				(this.enabledAccessControl() && ensure(get(), ["accessCode"])) ||
				!!isAuthenticated
			);
		},
		fetch() {
			if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
			fetchState = 1;
			fetch("/api/config", {
				method: "post",
				body: null,
				headers: {
					...getHeaders(),
				},
			})
				.then((res) => res.json())
				.then((res: DangerConfig) => {
					console.log("[Config] got config from server", res);
					set(() => ({ ...res }));
				})
				.catch(() => {
					console.error("[Config] failed to fetch config");
				})
				.finally(() => {
					fetchState = 2;
				});
		},
	}),
	{
		name: StoreKey.Access,
		version: 2,
		migrate(persistedState, version) {
			if (version < 2) {
				const state = persistedState as {
					token: string;
					openaiApiKey: string;
					azureApiVersion: string;
				};
				state.openaiApiKey = state.token;
				state.azureApiVersion = "2023-08-01-preview";
			}

			return persistedState as any;
		},
	},
);
