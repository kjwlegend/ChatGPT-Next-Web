import { create } from "zustand";
import { persist } from "zustand/middleware";

// 更新后的 User 接口
export interface User {
	id: number;
	nickname: string;
	avatar: string | null;
	type: string;
	birthDate: string | null; // 更新字段名
	gender: string;
	email: string;
	inviter: string | null;
	invite_code: string | null;
	invite_count: number;
	membership_level: string;
	phone_number: string | null;
	username: string;
	membership_expiry_date: string;
	last_refresh_date: string;
	virtual_currency: number;

	user_balance: {
		draw_balance: number;
		basic_chat_balance: number;
		pro_chat_balance: number;
		tarot_balance: number;
	};

	// 其他字段
	[key: string]: any;
}

// 用户对象的默认值
const defaultUser: User = {
	id: 0,
	nickname: "",
	avatar: null,
	type: "",
	birthDate: null,
	gender: "",
	email: "",
	inviter: null,
	invite_code: null,
	invite_count: 0,
	membership_level: "",
	phone_number: null,
	username: "",
	membership_expiry_date: "",
	last_refresh_date: "",
	virtual_currency: 0,
	user_balance: {
		draw_balance: 0,
		basic_chat_balance: 0,
		pro_chat_balance: 0,
		tarot_balance: 0,
	},
};

export interface UserStore {
	user: User;
	updateNickname: (nickname: string) => void;
	updateModelPreference: (modelPreference: string) => void;
	setUser: (user: User) => void;
	clearUser: () => void;
	updateUser: (user: Partial<User>) => void;
}

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			user: defaultUser, // 使用默认值

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
			updateUser: (user: Partial<User>) => {
				set((state) => ({
					user: {
						...state.user,
						...user,
					},
				}));
			},
			clearUser: () => {
				set({ user: defaultUser }); // 使用默认值
			},
		}),
		{
			name: "user-store",
			version: 2, // 更新版本号
			migrate: (persistedState, version) => {
				if (version === 1) {
					// 如果是版本1，清除所有数据，返回新结构的默认值
					return { user: defaultUser }; // 使用默认值
				}
				return persistedState; // 处理其他版本的迁移逻辑（如有需要）
			},
		},
	),
);
