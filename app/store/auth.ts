import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useRouter } from "next/navigation";

export interface AuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	login: (accessToken: string | null, refreshToken: string | null) => void;
	logout: () => void;
	getAccessToken: () => string | null;
	getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			isAuthenticated: false,
			accessToken: null,
			refreshToken: null,
			login: (accessToken, refreshToken) => {
				set({
					isAuthenticated: true,
					accessToken,
					refreshToken,
				});
			},
			logout: () => {
				set({ isAuthenticated: false, accessToken: null, refreshToken: null });
			},
			getAccessToken: () => {
				return get().accessToken;
			},
			getRefreshToken: () => {
				return get().refreshToken;
			},
		}),
		{
			name: "auth-store",
			version: 1,
		},
	),
);

type InviteCodeStore = {
	inviteCode: string | null;
	setInviteCode: (code: string | null) => void;
};

export const useInviteCodeStore = create<InviteCodeStore>()(
	persist(
		(set, get) => ({
			inviteCode: null,
			setInviteCode: (code) => set({ inviteCode: code }),
		}),
		{
			name: "invite-code-store",
			version: 1,
		},
	),
);
