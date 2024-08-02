"use client";
import React, { use, useState, useCallback } from "react";
import { useEffect } from "react";
import { Button, Layout, message } from "antd";
// import Sidebar from "./components/Sidebar";
import ChatArea from "./chatarea/ChatArea";
import { Path, SlotID } from "@/app/constant";
import styles from "./double-agents.module.scss";
import styles2 from "@/app/chats/home.module.scss";
import {
	HashRouter as Router,
	Routes,
	Route,
	useLocation,
	NavigationType,
} from "react-router-dom";

import {
	DoubleAgentChatContext,
	DoubleAgentChatProvider,
	useDoubleAgentChatContext,
} from "./doubleAgentContext";

import usedoubleAgentStore from "@/app/store/doubleAgents";
import { DoubleAgentChatSession } from "@/app/store/doubleAgents";
import { useAccessStore, useAppConfig, useUserStore } from "@/app/store";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
	LeftSquareOutlined,
	PlusCircleOutlined,
	RightSquareOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/app/store/auth";
import { Loading } from "@/app/components/ui-lib";
import { getClientConfig } from "@/app/config/client";
import { getCSSVar } from "@/app/utils";
import { getISOLang } from "@/app/locales";

const DoubleAgentSideBar = dynamic(
	async () => (await import("./components/sidebar")).DoubleAgentSideBar,
	{
		loading: () => null,
		ssr: false,
	},
);

const { Header, Content, Sider, Footer } = Layout;

const EmptyIntro = () => {
	const { startNewConversation } = useDoubleAgentChatContext();

	return (
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
			<div>
				<div className={styles["title"]}>
					您还没有对话, 请点击下面选项来探索AI世界
				</div>
				<p className={styles["sub-title"]}>
					双AI模式, 目前在4.0模型下表现较好, 3.5模型适配性较低
				</p>
			</div>

			<div className={styles["actions"]}>
				<Button
					type="primary"
					className={styles["action-button"]}
					icon={<PlusCircleOutlined />}
					onClick={() => {
						startNewConversation();
					}}
				>
					开启对话
				</Button>

				<Button
					type="default"
					className={styles["action-button"]}
					icon={<RightSquareOutlined />}
					onClick={() => {
						// go to learning page
						message.info("敬请期待");
					}}
				>
					学习用法
				</Button>
			</div>
		</div>
	);
};

const DoulbeAgentLayout: React.FC = () => {
	const doubleagents = usedoubleAgentStore();
	const userid = useUserStore.getState().user.id;
	const isAuth = useAuthStore.getState().isAuthenticated;

	const { conversations, currentConversationId, setCurrentConversationId } =
		doubleagents;

	// 避免服务器端渲染, 采用客户端渲染
	const [localconversations, setLocalConversations] = useState<
		DoubleAgentChatSession[]
	>([]);

	useEffect(() => {
		setLocalConversations(conversations);
	}, [conversations]);

	const MainScreen = () => {
		return !isAuth ? (
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
				<div className={styles["title"]}>您还未登录, 请登录后开启该功能</div>
				<div className={styles["actions"]}>
					<Button
						type="default"
						className={styles["action-button"]}
						icon={<PlusCircleOutlined />}
						onClick={() => {
							window.location.href = "/auth/";
						}}
					>
						登录
					</Button>
				</div>
			</div>
		) : localconversations.length >= 1 ? (
			<ChatArea />
		) : (
			<EmptyIntro />
		);
	};

	return (
		<DoubleAgentChatProvider>
			<Layout style={{ flexDirection: "row" }}>
				<DoubleAgentSideBar />

				<Layout
					className={`${styles2["window-content"]} ${styles["background"]}`}
				>
					<Content id={SlotID.AppBody}>
						<Routes>
							<Route path={"/"} element={<MainScreen />} />
							<Route path={Path.Chat} element={<MainScreen />} />
						</Routes>
					</Content>
				</Layout>
			</Layout>
		</DoubleAgentChatProvider>
	);
};

const useHasHydrated = () => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

function useSwitchTheme() {
	const config = useAppConfig();

	useEffect(() => {
		document.body.classList.remove("light");
		document.body.classList.remove("dark");

		if (config.theme === "dark") {
			document.body.classList.add("dark");
		} else if (config.theme === "light") {
			document.body.classList.add("light");
		}

		const metaDescriptionDark = document.querySelector(
			'meta[name="theme-color"][media*="dark"]',
		);
		const metaDescriptionLight = document.querySelector(
			'meta[name="theme-color"][media*="light"]',
		);

		if (config.theme === "auto") {
			metaDescriptionDark?.setAttribute("content", "#151515");
			metaDescriptionLight?.setAttribute("content", "#fafafa");
		} else {
			const themeColor = getCSSVar("--theme-color");
			metaDescriptionDark?.setAttribute("content", themeColor);
			metaDescriptionLight?.setAttribute("content", themeColor);
		}
	}, [config.theme]);
}

function useHtmlLang() {
	useEffect(() => {
		const lang = getISOLang();
		const htmlLang = document.documentElement.lang;

		if (lang !== htmlLang) {
			document.documentElement.lang = lang;
		}
	}, []);
}

export default function App() {
	useSwitchTheme();
	useHtmlLang();
	useEffect(() => {
		console.log("[Config] got config from build time", getClientConfig());
		useAccessStore.getState().fetch();
	}, []);

	if (!useHasHydrated()) {
		return <Loading />;
	}

	return (
		<Router>
			<DoulbeAgentLayout />
		</Router>
	);
}
