import React, { useState, useEffect, useMemo, useContext } from "react";
import { useDebouncedCallback } from "use-debounce";

import { getISOLang, getLang } from "../locales";

import BrainIcon from "../icons/brain.svg";
import RenameIcon from "../icons/rename.svg";
import ExportIcon from "../icons/share.svg";
import ReturnIcon from "../icons/return.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ConfirmIcon from "../icons/confirm.svg";
import CancelIcon from "../icons/cancel.svg";

import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAppConfig,
  DEFAULT_TOPIC,
  ChatSession,
} from "../store";

import {
  copyToClipboard,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import { api } from "../client/api";

import Locale from "../locales";

import { IconButton } from "../components/button";
import styles from "./multi-chats.module.scss";

import {
  List,
  ListItem,
  Modal,
  Selector,
  showConfirm,
  showPrompt,
  showToast,
} from "../components/ui-lib";

import { ContextPrompts, MaskAvatar, MaskConfig } from "../components/mask";

import { prettyObject } from "../utils/format";
import { ExportMessageModal } from "../components/exporter";
import { getClientConfig } from "../config/client";

import useAuth from "../hooks/useAuth";
import { message, Switch } from "antd";

import { SessionConfigModel } from "./common";

import { ChatContext } from "./context";

export function EditMessageModal(props: {
  onClose: () => void;
  index: number;
  session: ChatSession;
}) {
  const index = props.index;
  const sessionId = props.session.id;
  const session = props.session;

  const config = useAppConfig();
  const chatStore = useChatStore();

  const [messages, setMessages] = useState(session.messages.slice());

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.EditMessage.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            text={Locale.UI.Cancel}
            icon={<CancelIcon />}
            key="cancel"
            onClick={() => {
              props.onClose();
            }}
          />,
          <IconButton
            type="primary"
            text={Locale.UI.Confirm}
            icon={<ConfirmIcon />}
            key="ok"
            onClick={() => {
              chatStore.updateSession(sessionId, (session) => {
                session.messages = messages;
              });
              props.onClose();
            }}
          />,
        ]}
      >
        <List>
          <ListItem
            title={Locale.Chat.EditMessage.Topic.Title}
            subTitle={Locale.Chat.EditMessage.Topic.SubTitle}
          >
            <input
              type="text"
              value={session.topic}
              onInput={(e) =>
                chatStore.updateSession(sessionId, (session) => {
                  session.topic = e.currentTarget.value;
                })
              }
            ></input>
          </ListItem>
        </List>
        <ContextPrompts
          context={messages}
          updateContext={(updater) => {
            const newMessages = messages.slice();
            updater(newMessages);
            setMessages(newMessages);
          }}
        />
      </Modal>
    </div>
  );
}

export default function WindowHeader(props: {
  session: ChatSession;
  index: number;
}) {
  const sessionId = props.session.id;
  const session = props.session;
  const index = props.index;
  const chatStore = useChatStore();
  // const session = chatStore.currentSession();
  const config = useAppConfig();
  const [showExport, setShowExport] = useState(false);

  const {
    hitBottom,
    setHitBottom,

    showPromptModal,
    setShowPromptModal,
    userInput,
    setUserInput,
    enableAutoFlow,
    setEnableAutoFlow,
  } = useContext(ChatContext);

  const isMobileScreen = useMobileScreen();
  const clientConfig = useMemo(() => getClientConfig(), []);
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  const [isEditingMessage, setIsEditingMessage] = useState(false);

  return (
    <div className="window-header" data-tauri-drag-region>
      {isMobileScreen && (
        <div className="window-actions">
          <div className={"window-action-button"}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
            />
          </div>
        </div>
      )}

      <div className={`window-header-title ${styles["chat-body-title"]}`}>
        <div
          className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          onClickCapture={() => setIsEditingMessage(true)}
        >
          {!session.topic ? DEFAULT_TOPIC : session.topic}
        </div>
        <div className="window-header-sub-title">
          {Locale.Chat.SubTitle(session.messages.length)}
        </div>
      </div>
      <div className="window-actions">
        {!isMobileScreen && (
          // <div className="window-action-button">
          //   <IconButton
          //     icon={<RenameIcon />}
          //     bordered
          //     onClick={() => setIsEditingMessage(true)}
          //   />
          // </div>
          <div>
            <span style={{ marginRight: "10px", fontSize: "12px" }}>
              自动流
            </span>
            <Switch
              checkedChildren="开启"
              unCheckedChildren="人工"
              defaultChecked
              onChange={(checked) => {
                console.log(checked, index);
                setEnableAutoFlow(checked);
              }}
            />
          </div>
        )}
        {/* <div className="window-action-button">
          <IconButton
            icon={<ExportIcon />}
            bordered
            title={Locale.Chat.Actions.Export}
            onClick={() => {
              setShowExport(true);
            }}
          />
        </div>
        {showMaxIcon && (
          <div className="window-action-button">
            <IconButton
              icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
              bordered
              onClick={() => {
                config.update((config) => {
                  config.showHeader = !config.showHeader;
                });
              }}
            />
          </div>
        )} */}
      </div>
      {isEditingMessage && (
        <EditMessageModal
          onClose={() => {
            setIsEditingMessage(false);
          }}
          index={index}
          session={session}
        />
      )}
      <PromptToast
        showToast={!hitBottom}
        showModal={showPromptModal}
        setShowModal={setShowPromptModal}
        session={session}
        index={index}
      />
      {showExport && (
        <ExportMessageModal onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

export function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;

  index: number;
  session: ChatSession;
}) {
  const chatStore = useChatStore();
  const sessionId = props.session.id;
  const session = props.session;
  const index = props.index;
  const context = session.mask.context;

  return (
    <div
      className={styles["prompt-toast"] + " desktop-only"}
      key="prompt-toast"
    >
      {props.showToast && (
        <div
          className={styles["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={styles["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel
          onClose={() => props.setShowModal(false)}
          session={session}
          index={index}
        />
      )}
    </div>
  );
}
