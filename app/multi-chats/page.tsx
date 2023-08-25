"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { useDebouncedCallback } from "use-debounce";
import dynamic from "next/dynamic";

import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  Theme,
  useAppConfig,
  DEFAULT_TOPIC,
  ModelType,
  useUserStore,
} from "../store";
import { api } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import { useMaskStore } from "../store/mask";
import { useChatCommand, useCommand } from "../command";
import { getClientConfig } from "../config/client";
import useAuth from "../hooks/useAuth";
import { getISOLang, getLang } from "../locales";
import {
  copyToClipboard,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";
import {
  CHAT_PAGE_SIZE,
  LAST_INPUT_KEY,
  MAX_RENDER_MSG_COUNT,
  Path,
  REQUEST_TIMEOUT_MS,
} from "../constant";
import { prettyObject } from "../utils/format";

import BrainIcon from "../icons/brain.svg";
import LoadingIcon from "../icons/three-dots.svg";

import styles from "./multi-chats.module.scss";

import { IconButton } from "../components/button";
import {
  List,
  ListItem,
  Modal,
  Selector,
  showConfirm,
  showPrompt,
  showToast,
} from "../components/ui-lib";
import { Avatar } from "../components/emoji";
import { Avatar as UserAvatar } from "antd";
import { ContextPrompts, MaskAvatar, MaskConfig } from "../components/mask";
import { ExportMessageModal } from "../components/exporter";
import { useAuthStore } from "../store/auth";
import { createChat, CreateChatData } from "../api/chat";

import { ChatActions, ChatAction, Inputpanel } from "./Inputpanel";
import {
  useSubmitHandler,
  useScrollToBottom,
  ClearContextDivider,
} from "./chat-controller";
import WindowHeaer from "./WindowHeader";
import { Chatbody } from "./Chatbody";

// 创建 ChatContext 上下文对象
export const ChatContext = React.createContext<ChatContextType>({
  hitBottom: true,
  setHitBottom: () => void 0,
  autoScroll: true,
  setAutoScroll: () => void 0,
  showPromptModal: false,
  setShowPromptModal: () => void 0,
  userInput: "",
  setUserInput: () => void 0,
});

interface ChatContextType {
  hitBottom: boolean;
  setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
  autoScroll: boolean;
  setAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
  showPromptModal: boolean;
  setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
}
export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BrainIcon />}
      <LoadingIcon />
    </div>
  );
}

export type RenderPompt = Pick<Prompt, "title" | "content">;

function _Chat(props: { _session: any }) {
  const { _session } = props;

  const chatStore = useChatStore();
  const session = _session;

  const [hitBottom, setHitBottom] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });
      // auto sync mask config from global config
      if (session.mask.syncGlobalConfig) {
        console.log("[Mask] syncing from global, name = ", session.mask.name);
        session.mask.modelConfig = { ...config.modelConfig };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);

  return (
    <div className={styles.chat} key={session.id}>
      <ChatContext.Provider
        value={{
          hitBottom,
          setHitBottom,
          autoScroll,
          setAutoScroll,
          showPromptModal,
          setShowPromptModal,
          userInput,
          setUserInput,
        }}
      >
        <WindowHeaer />
        <Chatbody />
        <Inputpanel />
      </ChatContext.Provider>
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

export default function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  const sessions = chatStore.sessions;

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <div className={styles["chats-container"]}>
      {sessions.map((session, index) => (
        <_Chat key={index} _session={session} />
      ))}
    </div>
  );
}
