"use client";
import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/chats/home.module.scss";

import { IconButton } from "@/app/components/button";

import MainNav from "@/app/components/header";
import Locale from "@/app/locales";

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
import { useAppConfig, useChatStore } from "@/app/store";

import {
	DEFAULT_SIDEBAR_WIDTH,
	MAX_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	NARROW_SIDEBAR_WIDTH,
	Path,
	REPO_URL,
} from "@/app/constant";

import { Link, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "@/app/utils";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "@/app/components/ui-lib";
import { useAuthStore } from "@/app/store/auth";

import AuthPage from "@/app/(pages)/auth/page";
import DrawerMenu from "@/app/components/drawer-menu";

import { ChatSessionData } from "@/app/api/backend/chat";
import { updateChatSessions } from "@/app/services/chatService";
import { useUserStore } from "@/app/store/user";
import useDoubleAgentStore from "@/app/store/doubleAgents";

import { message } from "antd";

import { useDoubleAgentChatContext } from "../doubleAgentContext";
import { getMultiAgentSession, PaginationData } from "@/app/services/chats";
import { getChatSession } from "@/app/services/chats";
import { SideBar } from "@/app/chats/sidebar/sidebar";
import { ChatList } from "@/app/chats/sidebar/chatList";
import { useMultipleAgentsChatService } from "@/app/hooks/useMultipleAgentsHook";

export function DoubleAgentSideBar(props: { className?: string }) {
	const {
		chatSessions,
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useMultipleAgentsChatService();

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
