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

import { getChatSession } from "@/app/api/backend/chat";
import { ChatSessionData } from "@/app/api/backend/chat";
import { updateChatSessions } from "@/app/services/chatService";
import { useUserStore } from "@/app/store/user";
import useDoubleAgentStore from "@/app/store/doubleAgents";

import { message } from "antd";

const DoubleAgentChatList = dynamic(
	async () => (await import("./chatList")).DoubleAgentChatList,
	{
		loading: () => null,
	},
);

function useHotKey() {
	const chatStore = useChatStore();

	useEffect(() => {
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
import { useDoubleAgentChatContext } from "../doubleAgentContext";
export function DoubleAgentSideBar(props: { className?: string }) {
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

	const { startNewConversation } = useDoubleAgentChatContext();

	// 加载更多会话
	const loadMoreSessions = async () => {
		if (hasMore) {
			const param: ChatSessionData = {
				user: userStore.user.id,
				limit: 20,
				page: page, // 使用当前页码
			};
			try {
				const chatSessionList = await getChatSession(param);
				console.log("chatSessionList", chatSessionList.data);
				updateChatSessions(chatSessionList.data);
				setPage((prevPage) => prevPage + 1);
				setHasMore(chatSessionList.is_next); // 根据返回的is_next更新是否还有更多数据
			} catch (error) {
				console.log("get chatSession list error", error);
			}
		}
	};
	useEffect(() => {
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

		return () => {
			if (listElement) {
				listElement.removeEventListener("scroll", handleScroll);
			}
		};
	}, [hasMore, page]); // 依赖项数组

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
			<div className="flex-container row m-b-20">
				{isMobileScreen && (
					<>
						<DrawerMenu />
					</>
				)}

				{/* {!shouldNarrow && <UserInfo />} */}
			</div>

			<div className={styles["sidebar-header-bar"]}>
				{/* <IconButton
					icon={<MaskIcon />}
					text={shouldNarrow ? undefined : Locale.Mask.Name}
					className={styles["sidebar-bar-button"]}
					onClick={() => {
						if (config.dontShowMaskSplashScreen !== true) {
							navigate(Path.NewChat, {
								state: { fromHome: true },
							});
						} else {
							navigate(Path.Masks, { state: { fromHome: true } });
						}
					}}
					shadow
				/> */}
			</div>

			<div className={styles["sidebar-body"]} ref={listRef}>
				<DoubleAgentChatList narrow={shouldNarrow} />
			</div>
			<div className={styles["sidebar-tail"]}>
				<div className={styles["sidebar-actions"]}>
					<div>
						<IconButton
							icon={<AddIcon />}
							text={shouldNarrow ? undefined : Locale.Home.NewChat}
							onClick={() => startNewConversation()}
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
