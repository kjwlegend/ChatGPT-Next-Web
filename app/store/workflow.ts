import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatSession } from "./chat";

type State = {
  sessions: ChatSession[];
  selectedIndex: number;
  setSessions: (sessions: any) => void;
  moveSession: (sourceIndex: number, destinationIndex: number) => void;
  selectSession: (index: number) => void;
  sessionClickHandler: (index: number) => void;
  sessionDeleteHandler: (index: number) => void;
};

export const useWorkflowStore = create<State>()(
  persist(
    (set, get) => ({
      sessions: [],
      selectedIndex: 0,
      setSessions: (newSession) => {
        set((state) => {
          const { sessions } = state;
          newSession = [...sessions, newSession];
          return { sessions: newSession };
        });
      },
      moveSession: (sourceIndex, destinationIndex) => {
        set((state) => {
          const newSessions = [...state.sessions];
          const [removed] = newSessions.splice(sourceIndex, 1);
          newSessions.splice(destinationIndex, 0, removed);
          return { sessions: newSessions };
        });
      },
      selectSession: (index) => {
        set({ selectedIndex: index });
      },
      sessionClickHandler: (index) => {
        console.log("sessionClickHandler", index);
        set({ selectedIndex: index });
      },
      sessionDeleteHandler: (index) => {
        console.log("sessionDeleteHandler", index);
        set((state) => {
          const newSessions = [...state.sessions];
          newSessions.splice(index, 1);
          return { sessions: newSessions };
        });
      },
    }),
    {
      name: "workflow-store", // 存储名称
    },
  ),
);
