"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "@/app/chats/home.module.scss";

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

import AuthPage from "../auth/page";
import DrawerMenu from "../../components/drawer-menu";

import { getChatSession } from "../../api/backend/chat";
import { ChatSessionData } from "../../api/backend/chat";
import { UpdateChatSessions } from "../../services/chatService";
import { useUserStore } from "../../store/user";
import useDoubleAgentStore from "@/app/store/doubleAgents";

import { useWorkflowStore } from "../../store/workflow";

import { message } from "antd";

const WorkflowChatList = dynamic(
	async () => (await import("./chatList")).WorkflowChatList,
	{
		loading: () => null,
	},
);

function useHotKey() {
	const chatStore = useChatStore();

	useEffect(() => {
		if (typeof window === undefined) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.altKey || e.ctrlKey) {
				if (e.key === "ArrowUp") {
					chatStore.nextSession(-1);
				} else if (e.key === "ArrowDown") {
					chatStore.nextSession(1);
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	});
}

function useDragSideBar() {
	const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

	const config = useAppConfig();
	const startX = useRef(0);
	const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
	const lastUpdateTime = useRef(Date.now());

	const toggleSideBar = () => {
		config.update((config) => {
			if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
				config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
			} else {
				config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
			}
		});
	};

	const onDragStart = (e: MouseEvent) => {
		// Remembers the initial width each time the mouse is pressed
		startX.current = e.clientX;
		startDragWidth.current = config.sidebarWidth;
		const dragStartTime = Date.now();

		if (typeof window === undefined) return;
		const handleDragMove = (e: MouseEvent) => {
			if (Date.now() < lastUpdateTime.current + 20) {
				return;
			}
			lastUpdateTime.current = Date.now();
			const d = e.clientX - startX.current;
			const nextWidth = limit(startDragWidth.current + d);
			config.update((config) => {
				if (nextWidth < MIN_SIDEBAR_WIDTH) {
					config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
				} else {
					config.sidebarWidth = nextWidth;
				}
			});
		};

		const handleDragEnd = () => {
			// In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
			window.removeEventListener("pointermove", handleDragMove);
			window.removeEventListener("pointerup", handleDragEnd);

			// if user click the drag icon, should toggle the sidebar
			const shouldFireClick = Date.now() - dragStartTime < 300;
			if (shouldFireClick) {
				toggleSideBar();
			}
		};

		window.addEventListener("pointermove", handleDragMove);
		window.addEventListener("pointerup", handleDragEnd);
	};

	const isMobileScreen = useMobileScreen();
	const shouldNarrow =
		!isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

	useEffect(() => {
		const barWidth = shouldNarrow
			? NARROW_SIDEBAR_WIDTH
			: limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
		const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
		document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
	}, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

	return {
		onDragStart,
		shouldNarrow,
	};
}

import { DOUBLE_AGENT_DEFAULT_TOPIC } from "@/app/store/doubleAgents";
import { useDoubleAgentChatContext } from "../double-agents/doubleAgentContext";
import { WorkflowContext, useWorkflowContext } from "./workflowContext";
export function WorkflowSidebar(props: { className?: string }) {
	const chatStore = useDoubleAgentStore();
	const authStore = useAuthStore();
	const userStore = useUserStore();
	const userid = userStore.user.id;
	const [messageAPi, contextholder] = message.useMessage();
	// drag side bar
	const { onDragStart, shouldNarrow } = useDragSideBar();
	const config = useAppConfig();
	const isMobileScreen = useMobileScreen();
	const { setCurrentConversationId } = chatStore;
	useHotKey();

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const listRef = useRef<HTMLDivElement | null>(null);

	const { addWorkflowGroup, deleteWorkflowGroup, getworkFlowSessions } =
		useWorkflowContext();

	let prevPage = page;
	const loadMoreSessions = async () => {
		if (hasMore) {
			const param: ChatSessionData = {
				user: userStore.user.id,
				limit: 15,
				page: prevPage, // 使用当前页码
			};
			try {
				const chatSessionList = await getworkFlowSessions(param);
				// UpdateChatSessions(chatSessionList.data);
				if (chatSessionList.is_next) {
					setPage(prevPage + 1);
					console.log("page", page);
					setHasMore(chatSessionList.is_next); // 根据返回的is_next更新是否还有更多数据
				} else {
					setHasMore(false);
				}
			} catch (error) {
				console.log("get chatSession list error", error);
			}
		}
	};

	useEffect(() => {
		// 取消注释掉 loadMoreSessions 调用
		loadMoreSessions();
		const handleScroll = (event: Event) => {
			const target = event.target as HTMLDivElement;
			const { scrollTop, clientHeight, scrollHeight } = target;
			if (scrollTop + clientHeight >= scrollHeight - 100) {
				loadMoreSessions();
			}
		};
		const listElement = listRef.current; // 通过ref获取DOM元素
		if (listElement) {
			listElement.addEventListener("scroll", handleScroll);
		}
		// 返回一个函数来移除事件监听器
		return () => {
			if (listElement && listElement.removeEventListener) {
				listElement.removeEventListener("scroll", handleScroll);
			}
		};      
	}, [page]); // 移除了 hasMore，因为它的值在组件挂载后不会改变

	if (typeof window === undefined) {
		console.log("window is undefined");
	}

	if (isMobileScreen && !authStore.isAuthenticated) {
		return (
			<div
				className={`${styles.sidebar} ${props.className} ${styles["narrow-sidebar"]} ${styles["login"]}`}
			>
				<AuthPage />
			</div>
		);
	}

	return (
		<div
			className={`${styles.sidebar}
       ${props.className} ${shouldNarrow && styles["narrow-sidebar"]}`}
		>
			{contextholder}

			<div className={styles["sidebar-body"]} ref={listRef}>
				<WorkflowChatList narrow={shouldNarrow} />
			</div>
			<div className={styles["sidebar-tail"]}>
				<div className={styles["sidebar-actions"]}>
					<div>
						<IconButton
							icon={<AddIcon />}
							text={shouldNarrow ? undefined : Locale.Home.NewChat}
							onClick={() => addWorkflowGroup()}
							shadow
						/>
					</div>
				</div>
			</div>

			<div
				className={styles["sidebar-drag"]}
				onPointerDown={(e) => onDragStart(e as any)}
			>
				<DragIcon />
			</div>
		</div>
	);
}
