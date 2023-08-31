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
  ChatSession,
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
import { PlusCircleOutlined } from "@ant-design/icons";

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
import { Avatar as UserAvatar, Button, Menu, Dropdown } from "antd";
import type { MenuProps } from "antd";
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
import { ChatContext } from "./context";
import Image from "next/image";
import { ChatItemShort } from "../components/chat-list";

export type RenderPompt = Pick<Prompt, "title" | "content">;

function _Chat(props: { _session: ChatSession; index: number }) {
  const { _session, index } = props;
  const sessionId = _session.id;

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
    chatStore.updateSession(sessionId, (session) => {
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
    <>
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
          <WindowHeaer session={_session} index={index} />
          <Chatbody session={_session} index={index} />
          <Inputpanel session={_session} index={index} />
        </ChatContext.Provider>
      </div>
    </>
  );
}

const useHasHydrated = (): boolean => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const GenerateMenuItems = () => {
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const maskStore = useMaskStore().getAll();
  const {
    sessions,
    selectedIndex,
    setSessions,
    moveSession,
    selectSession,
    sessionClickHandler,
    sessionDeleteHandler,
  } = useWorkflowStore();

  const allSessions = chatStore.sessions;

  const sessionItems = allSessions.map((item) => ({
    key: item.id,
    label: item.topic,
    onClick: () => {
      // 将allsessions中的session, 被点击的那一个复制到sessions中
      // 判断是否已经添加了相同 key 的 session
      const isSessionExist = sessions.some((session) => session.id === item.id);
      if (!isSessionExist) {
        setSessions(item);
      }
    },
  }));

  const handleMaskClick = (mask: any) => {
    const newsession: ChatSession = chatStore.newSession(mask, userStore);
    setSessions(newsession);
  };

  const maskItems = Object.values(maskStore).reduce((result, mask) => {
    const category = mask.category;
    const categoryItem = result.find((item) => item.label === category);

    if (categoryItem) {
      categoryItem.children.push({
        key: mask.id,
        label: mask.name,
        onClick: () => {
          handleMaskClick(mask);
        },
      });
    } else {
      result.push({
        key: category,
        label: category,
        children: [
          {
            key: mask.id,
            label: mask.name,
            onClick: () => {
              handleMaskClick(mask);
            },
          },
        ],
      });
    }

    return result;
  }, [] as { key: string; label: string; children: { key: string; label: string; onClick?: () => void }[] }[]);

  return [
    {
      key: "1",
      label: "选择已有对话",
      children: sessionItems,
    },
    {
      key: "2",
      label: "新建其他助手",
      children: maskItems,
    },
  ];
};

import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from "@hello-pangea/dnd";
import { useWorkflowStore } from "../store/workflow";

function SessionList() {
  const {
    sessions,
    selectedIndex,
    setSessions,
    moveSession,
    selectSession,
    sessionClickHandler,
    sessionDeleteHandler,
  } = useWorkflowStore();

  const items: MenuProps["items"] = GenerateMenuItems();

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
  };

  return (
    <>
      <div className={styles["session-container"]}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chat-list" direction="horizontal">
            {(provided) => (
              <div
                className={styles["session-list"]}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {sessions.map((item, i) => (
                  <ChatItemShort
                    title={item.topic}
                    time={new Date(item.lastUpdate).toLocaleString()}
                    count={item.messages.length}
                    key={item.id}
                    id={item.id}
                    index={i}
                    selected={i === selectedIndex}
                    onClick={() => {
                      sessionClickHandler(i);
                    }}
                    onDelete={async () => {
                      sessionDeleteHandler(i);
                      // chatStore.deleteSession(i, userStore);
                    }}
                    mask={item.mask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* button 样式 新增session */}

        {/* 下拉菜单 */}

        <Dropdown menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <Button
              type="dashed"
              className={styles["plus"]}
              icon={<PlusCircleOutlined />}
            >
              新增助手
            </Button>
          </a>
        </Dropdown>
      </div>
    </>
  );
}

export default function Chat() {
  const workflowStore = useWorkflowStore();
  const sessions = workflowStore.sessions;

  const items: MenuProps["items"] = GenerateMenuItems();

  if (!useHasHydrated()) {
    return (
      <>
        <LoadingIcon />
        <p>Loading..</p>
      </>
    );
  }

  return (
    <>
      <SessionList />
      <div className={styles["chats-container"]}>
        {sessions.length !== 0 ? (
          sessions.map((session, index) => (
            <_Chat key={index} _session={session} index={index} />
          ))
        ) : (
          <div className={styles["welcome-container"]}>
            <div className={styles["logo"]}>
              <Image
                className={styles["logo-image"]}
                src="/logo-2.png"
                alt="Logo"
                width={200}
                height={253}
              />
            </div>
            <div className={styles["title"]}>
              点击
              <Dropdown
                menu={{ items }}
                autoAdjustOverflow={true}
                autoFocus={true}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Button
                    type="dashed"
                    className={styles["plus"]}
                    icon={<PlusCircleOutlined />}
                  >
                    新增助手
                  </Button>
                </a>
              </Dropdown>{" "}
              来开启工作流
            </div>
            <div className={styles["sub-title"]}>
              在本页删除助手, 不会影响正常页的会话. 超级对话功能只在电脑端生效,
              手机端无法使用.
              <p>该功能于会员功能, 目前限时开放.</p>
            </div>
            <div className={styles["actions"]}></div>
          </div>
        )}
      </div>
    </>
  );
}
