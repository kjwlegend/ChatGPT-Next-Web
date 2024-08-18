import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import React from "react";

import styles from "./sidebar.module.scss";

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
import UserInfo from "@/app/components/userinfo";
import { Divider } from "antd";

import { updateChatSessions } from "@/app/services/chatService";
import { useUserStore } from "@/app/store/user";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

const ChatList = dynamic(async () => (await import("./chatList")).ChatList, {
	loading: () => null,
});

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

type LoadMoreSessions = (
	page: number,
) => Promise<{ data: any[]; is_next: boolean }>; // 根据你的数据结构调整类型

interface SideBarProps {
	className?: string;
	loadMoreSessions: LoadMoreSessions;
	onAddClick: () => void;
	onChatItemClick: (id: string) => void;
	onChatItemDelete: (id: number) => void;
	onChatItemEdit?: (id: string) => void | undefined;
	chatSessions: any[];
	ChatListComponent: React.ComponentType<{
		narrow?: boolean;
		chatSessions: any[];
		onChatItemClick: (id: string) => void;
		onChatItemDelete: (id: number) => void;
		onChatItemEdit?: (id: string) => void;
	}>; // 传递 ChatList 组件
}

export function SideBar({
	className,
	loadMoreSessions,
	onAddClick,
	onChatItemClick,
	onChatItemDelete,
	onChatItemEdit,
	chatSessions,
	ChatListComponent,
}: SideBarProps) {
	const chatStore = useChatStore();
	const authStore = useAuthStore();
	const userStore = useUserStore();
	const { onDragStart, shouldNarrow } = useDragSideBar();
	// const navigate = useNavigate();
	const config = useAppConfig();
	const isMobileScreen = useMobileScreen();
	const isIOSMobile = useMemo(
		() => isIOS() && isMobileScreen,
		[isMobileScreen],
	);
	// const [chatSessions, setChatSessions] = useState<any[]>([]); // 根据你的数据结构调整类型
	useHotKey();

	// 加载更多会话
	const handleLoadMore = async () => {
		if (hasMore) {
			console.log("load chat session");
			try {
				const chatSessionList = await loadMoreSessions(page);
				// setChatSessions((prevSessions) => {
				// 	const updatedSessions = [...chatSessionList.data];
				// 	// 在这里可以执行依赖于更新后的状态的逻辑

				// 	return updatedSessions;
				// });
				setPage((prevPage) => prevPage + 1);
				setHasMore(chatSessionList.is_next);
			} catch (error) {
				console.log("get chatSession list error", error);
			}
		}
	};

	useEffect(() => {
		console.log("Updated chat sessions:", chatSessions);
	}, [chatSessions]);

	const { page, loadRef, hasMore, setHasMore, setPage } =
		useInfiniteScroll(handleLoadMore);

	if (isMobileScreen && !authStore.isAuthenticated) {
		return (
			<div
				className={`${styles.sidebar} ${className} ${styles["narrow-sidebar"]} ${styles["login"]}`}
			>
				<AuthPage />
			</div>
		);
	}

	return (
		<div
			className={`${styles.sidebar}
       ${className} ${shouldNarrow && styles["narrow-sidebar"]}`}
		>
			{/* */}

			<div className={styles["sidebar-header-bar"]}>
				{isMobileScreen && (
					<div className="flex-container row m-b-20">
						<DrawerMenu />
					</div>
				)}

				<div>
					<IconButton
						icon={<AddIcon />}
						text={shouldNarrow ? undefined : Locale.Home.NewChat}
						onClick={onAddClick}
						shadow
					/>
				</div>
			</div>

			<div
				className={styles["sidebar-body"]}
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						// navigate(Path.Home);
					}
				}}
			>
				<ChatListComponent
					narrow={shouldNarrow}
					chatSessions={chatSessions}
					onChatItemClick={onChatItemClick}
					onChatItemDelete={onChatItemDelete}
					onChatItemEdit={onChatItemEdit}
				/>
				<div ref={loadRef}> ...</div>
			</div>

			<div className={styles["sidebar-tail"]}>
				<UserInfo />
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
