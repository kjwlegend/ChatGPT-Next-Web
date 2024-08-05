"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/(chat-pages)/chats/home.module.scss";

import { IconButton } from "../../components/button";

import MainNav from "../../components/header";
import Locale from "../../locales";

import {
	SettingsIcon,
	GithubIcon,
	ChatGptIcon,
	AddIcon,
	CloseIcon,
	DeleteIcon,
	MaskIcon,
	PluginIcon,
	DragIcon,
} from "@/app/icons";
import Image from "next/image";
import { useAppConfig, useChatStore } from "../../store";

import {
	DEFAULT_SIDEBAR_WIDTH,
	MAX_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	NARROW_SIDEBAR_WIDTH,
	Path,
	REPO_URL,
} from "../../constant";

import { Link, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "../../utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "../../components/ui-lib";
import { useAuthStore } from "../../store/auth";

import AuthPage from "../../(pages)/auth/page";
import DrawerMenu from "../../components/drawer-menu";

import { getChatSession } from "../../api/backend/chat";
import { ChatSessionData } from "../../api/backend/chat";
import { updateChatSessions } from "../../services/chatService";
import { useUserStore } from "../../store/user";
import useDoubleAgentStore from "@/app/store/doubleAgents";

import { useWorkflowStore } from "../../store/workflow";

import { message } from "antd";

import { WorkflowContext, useWorkflowContext } from "./workflowContext";
import { useSimpleWorkflowService } from "@/app/hooks/useSimpleWorkflowHook";
import { SideBar } from "@/app/(chat-pages)/chats/sidebar/sidebar";
import { ChatList } from "@/app/(chat-pages)/chats/sidebar/chatList";
export function WorkflowSidebar(props: { className?: string }) {
	const {
		chatSessions,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useSimpleWorkflowService();

	return (
		<SideBar
			className={styles["sidebar-show"]}
			chatSessions={chatSessions}
			loadMoreSessions={loadMoreSessions}
			onAddClick={handleAddClick}
			onChatItemClick={handleChatItemClick}
			onChatItemDelete={handleChatItemDelete}
			ChatListComponent={ChatList}
		/>
	);
}
