import {
	useEffect,
	useRef,
	useMemo,
	useState,
	useCallback,
	useReducer,
} from "react";
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

import { useMobileScreen } from "@/app/hooks/useMobileScreen";
import dynamic from "next/dynamic";
import { showConfirm, showToast } from "@/app/components/ui-lib";
import { useAuthStore } from "@/app/store/auth";

import AuthPage from "@/app/(pages)/auth/page";
import DrawerMenu from "@/app/components/drawer-menu";
import UserInfo from "@/app/components/userinfo";
import { Divider } from "antd";

import { useUserStore } from "@/app/store/user";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";
import { NodeCollapseOutlined } from "@ant-design/icons";

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

function useToggleSideBar() {
	const config = useAppConfig();
	const isMobileScreen = useMobileScreen();

	const toggleSideBar = useCallback(() => {
		config.update((config) => {
			config.sidebarWidth =
				config.sidebarWidth < MIN_SIDEBAR_WIDTH
					? DEFAULT_SIDEBAR_WIDTH
					: NARROW_SIDEBAR_WIDTH;
		});
	}, [config]);

	const shouldNarrow =
		!isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

	useEffect(() => {
		const barWidth = shouldNarrow
			? NARROW_SIDEBAR_WIDTH
			: Math.min(
					MAX_SIDEBAR_WIDTH,
					config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH,
				);
		// const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
		const sideBarWidth = `${barWidth}px`;

		document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
	}, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

	return {
		toggleSideBar,
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

// extendSidebarProps
interface SideBarToggleProps extends SideBarProps {
	shouldNarrow: boolean;
	toggleSideBar: () => void;
}

import { memo } from "react";

const DesktopSideBar = ({
	className,
	chatSessions,
	onAddClick,
	onChatItemClick,
	onChatItemDelete,
	onChatItemEdit,
	ChatListComponent,
	loadMoreSessions,
	shouldNarrow,
	toggleSideBar,
}: SideBarToggleProps) => {
	const { page, loadRef, hasMore, setHasMore, setPage } = useInfiniteScroll(
		async () => {
			if (hasMore) {
				try {
					const chatSessionList = await loadMoreSessions(page);
					setPage((prevPage) => prevPage + 1);
					setHasMore(chatSessionList.is_next);
				} catch (error) {
					console.log("get chatSession list error", error);
				}
			}
		},
	);

	return (
		<div
			className={`${styles.sidebar} ${className} ${
				shouldNarrow && styles["narrow-sidebar"]
			}`}
		>
			<div className={styles["sidebar-header-bar"]}>
				<div className="flex-container space-between">
					<IconButton
						icon={<AddIcon styles={{ fill: "white" }} />}
						text={shouldNarrow ? undefined : Locale.Home.NewChat}
						onClick={onAddClick}
						shadow
						// type="primary"
					/>
					<IconButton
						icon={<NodeCollapseOutlined />}
						text={shouldNarrow ? undefined : "隐藏"}
						onClick={toggleSideBar}
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
				{!shouldNarrow && <UserInfo />}
			</div>

			<div
				className={styles["sidebar-drag"]}
				onPointerDown={(e) => toggleSideBar()}
			>
				<DragIcon />
			</div>
		</div>
	);
};

function MobileSideBar({
	className,
	chatSessions,
	onAddClick,
	onChatItemClick,
	onChatItemDelete,
	onChatItemEdit,
	ChatListComponent,
	loadMoreSessions,
}: SideBarToggleProps) {
	const authStore = useAuthStore();
	const { page, loadRef, hasMore, setHasMore, setPage } = useInfiniteScroll(
		async () => {
			if (hasMore) {
				try {
					const chatSessionList = await loadMoreSessions(page);
					setPage((prevPage) => prevPage + 1);
					setHasMore(chatSessionList.is_next);
				} catch (error) {
					console.log("get chatSession list error", error);
				}
			}
		},
	);

	if (!authStore.isAuthenticated) {
		return (
			<div
				className={`${styles.sidebar} ${className} ${styles["narrow-sidebar"]} ${styles["login"]}`}
			>
				<AuthPage />
			</div>
		);
	}

	return (
		<div className={`${styles.sidebar} ${className}`}>
			<div className={styles["sidebar-header-bar"]}>
				<div className={styles["header-content"]}>
					<DrawerMenu />
					<div className={styles["logo-container"]}>
						<Image
							src="/bot.png"
							alt="xiaoguang AI LOGO"
							width={30}
							height={30}
						/>
						<span className={styles["logo-text"]}>小光AI</span>
					</div>
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
					narrow={false}
					chatSessions={chatSessions}
					onChatItemClick={onChatItemClick}
					onChatItemDelete={onChatItemDelete}
					onChatItemEdit={onChatItemEdit}
				/>
				<div ref={loadRef}> ...</div>
			</div>

			<div className={styles["sidebar-tail"]}>
				<UserInfo />
				<IconButton
					icon={<AddIcon styles={{ fill: "white" }} />}
					text={Locale.Home.NewChat}
					onClick={onAddClick}
					shadow
					// type="primary"
				/>
			</div>
		</div>
	);
}

export function SideBar(props: SideBarProps) {
	const { toggleSideBar, shouldNarrow } = useToggleSideBar();
	const isMobileScreen = useMobileScreen();

	useEffect(() => {
		console.log("sidebar render", props.chatSessions);
	}, [props.chatSessions]);

	useHotKey();

	return isMobileScreen ? (
		<MobileSideBar
			{...props}
			shouldNarrow={shouldNarrow}
			toggleSideBar={toggleSideBar}
		/>
	) : (
		<DesktopSideBar
			{...props}
			shouldNarrow={shouldNarrow}
			toggleSideBar={toggleSideBar}
		/>
	);
}
