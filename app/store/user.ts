import create from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  nickname: string;
  avatar: string | null;
  type: string;
  constellation: string | null;
  birthday: string | null;
  gender: number;
}

interface UserStore {
  user: User;
  updateNickname: (nickname: string) => void;
  updateModelPreference: (modelPreference: string) => void;
  setUser: (user: User) => void;
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
        gender: 0,
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
    }),
    {
      name: "user-store",
      version: 1,
    },
  ),
);
