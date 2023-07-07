import create from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  nickname: string;
  modelPreference: string;
  authInfo: any;

  updateNickname: (nickname: string) => void;
  updateModelPreference: (modelPreference: string) => void;
  updateAuthInfo: (authInfo: any) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      nickname: "",
      modelPreference: "",
      authInfo: {},

      updateNickname: (nickname) => {
        set((state) => ({ ...state, nickname }));
      },
      updateModelPreference: (modelPreference) => {
        set((state) => ({ ...state, modelPreference }));
      },
      updateAuthInfo: (authInfo) => {
        set((state) => ({ ...state, authInfo }));
      },
    }),
    () => ({
      name: "user-store",
      version: 1,
    }),
  ),
);
