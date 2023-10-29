import create from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	id: number;
	nickname: string;
	avatar: string | null;
	type: string;
	constellation: string | null;
	birthday: string | null;
	gender: string;
	email: string;
	inviter: string | null;
	invite_code: string | null;
	invite_count: number;
	member_type: string;
	phone_number: string | null;
	username: string;
	member_expire_date: string;
	chat_balance: number;
	draw_balance: number;
	xgb_balance: number;
}

export interface UserStore {
	user: User;
	updateNickname: (nickname: string) => void;
	updateModelPreference: (modelPreference: string) => void;
	setUser: (user: User) => void;
	clearUser: () => void;
}
export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: {
				id: 0,
				nickname: "",
				avatar: null,
				type: "",
				constellation: null,
				birthday: null,
				gender: "",
				email: "",
				inviter: null,
				invite_code: null,
				invite_count: 0,
				member_type: "",
				phone_number: null,
				username: "",
				member_expire_date: "",
				chat_balance: 0,
				draw_balance: 0,
				xgb_balance: 0,
			},

			updateNickname: (nickname) => {
				set((state) => ({
					user: {
						...state.user,
						nickname,
					},
				}));
			},
			updateModelPreference: (modelPreference) => {
				set((state) => ({
					user: {
						...state.user,
						modelPreference,
					},
				}));
			},
			setUser: (user: User) => set({ user }),
			clearUser: () => {
				set((state) => ({
					user: {
						...state.user,
						id: 0,
						nickname: "",
						avatar: null,
						type: "",
						constellation: null,
						birthday: null,
						gender: "",
						email: "",
						inviter: null,
						invite_code: null,
						invite_count: 0,
						member_type: "",
						phone_number: null,
						username: "",
					},
				}));
			},
		}),
		{
			name: "user-store",
			version: 1,
		},
	),
);
