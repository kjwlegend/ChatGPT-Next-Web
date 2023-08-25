"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
} from "react";

import { getISOLang, getLang } from "@/app/locales";

import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import PromptIcon from "../icons/prompt.svg";
import MaskIcon from "../icons/mask.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import BreakIcon from "../icons/break.svg";
import SettingsIcon from "../icons/chat-settings.svg";
import DeleteIcon from "../icons/clear.svg";
import PinIcon from "../icons/pin.svg";
import EditIcon from "../icons/rename.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";

import LightIcon from "../icons/light.svg";
import DarkIcon from "../icons/dark.svg";
import AutoIcon from "../icons/auto.svg";
import BottomIcon from "../icons/bottom.svg";
import StopIcon from "../icons/pause.svg";
import RobotIcon from "../icons/robot.svg";

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
} from "@/app/store";

import {
  copyToClipboard,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "@/app/utils";

import { api } from "@/app/client/api";

import dynamic from "next/dynamic";

import { ChatControllerPool } from "@/app/client/controller";
import { Prompt, usePromptStore } from "@/app/store/prompt";
import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "./multi-chats.module.scss";

import {
  List,
  ListItem,
  Modal,
  Selector,
  showConfirm,
  showPrompt,
  showToast,
} from "@/app/components/ui-lib";
import {
  CHAT_PAGE_SIZE,
  LAST_INPUT_KEY,
  MAX_RENDER_MSG_COUNT,
  Path,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { Avatar } from "@/app/components/emoji";
import { Avatar as UserAvatar } from "antd";
import { ContextPrompts, MaskAvatar, MaskConfig } from "@/app/components/mask";
import { useMaskStore } from "@/app/store/mask";
import { ChatCommandPrefix, useChatCommand, useCommand } from "@/app/command";
import { prettyObject } from "@/app/utils/format";
import { ExportMessageModal } from "@/app/components/exporter";
import { getClientConfig } from "@/app/config/client";
import { useAuthStore } from "@/app/store/auth";
import { createChat, CreateChatData } from "@/app/api/chat";
import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import { ChatActions, ChatAction, Inputpanel } from "./Inputpanel";
import {
  useSubmitHandler,
  useScrollToBottom,
  ClearContextDivider,
} from "./chat-controller";
import WindowHeaer from "./WindowHeader";
import { Chatbody } from "./Chatbody";

export type RenderPompt = Pick<Prompt, "title" | "content">;

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BrainIcon />}
      <LoadingIcon />
    </div>
  );
}

interface ChatContextType {
  hitBottom: boolean;
  setHitBottom: React.Dispatch<React.SetStateAction<boolean>>;
  showPromptModal: boolean;
  setShowPromptModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// 创建 ChatContext 上下文对象
export const ChatContext = React.createContext<ChatContextType>({
  hitBottom: true,
  setHitBottom: () => void 0,
  showPromptModal: false,
  setShowPromptModal: () => void 0,
});

function _Chat(props: { _session: any }) {
  const { _session } = props;

  const chatStore = useChatStore();
  // const session = chatStore.currentSession();
  const session = _session;

  const [hitBottom, setHitBottom] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);
  console.log("showPromptModal", showPromptModal);

  const config = useAppConfig();
  const userStore = useUserStore();
  const authHook = useAuth();
  const [showExport, setShowExport] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isMobileScreen = useMobileScreen();

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);

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

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  // edit / insert message modal

  return (
    <div className={styles.chat} key={session.id}>
      <ChatContext.Provider
        value={{ hitBottom, setHitBottom, showPromptModal, setShowPromptModal }}
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

export default function Chat() {
  const chatStore = useChatStore();
  const sessionIndex = chatStore.currentSessionIndex;
  const sessions = chatStore.sessions; // 假设 sessions 是一个包含所有会话的数组

  return (
    <div className={styles["chats-container"]}>
      {sessions.map((session, index) => (
        <_Chat key={index} _session={session} />
      ))}
      {/* <_Chat key={sessionIndex} session={sessionIndex}></_Chat> */}
    </div>
  );
}
