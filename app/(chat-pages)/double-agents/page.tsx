"use client";
import React, { useState, useEffect, memo } from "react";
import { Button, Layout, message } from "antd";
import { useAuthStore } from "@/app/store/auth";
import { useMultipleAgentStore } from "@/app/store/multiagents";
import {
	MultiAgentChatProvider,
	useConversationActions,
} from "./multiAgentContext";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Path, SlotID } from "@/app/constant";
import styles2 from "@/app/(chat-pages)/chats/home.module.scss";
import styles from "./multi-agents.module.scss";
import Image from "next/image";
import { PlusCircleOutlined, RightSquareOutlined } from "@ant-design/icons";
import { Loading } from "@/app/components/ui-lib";
import { getClientConfig } from "@/app/config/client";
import { getISOLang } from "@/app/locales";
import { useAccessStore } from "@/app/store";

import dynamic from "next/dynamic";

const MultiAgentSideBar = dynamic(
	async () => (await import("./components/sidebar")).MultiAgentSideBar,
	{ loading: () => null, ssr: false },
);

const ChatArea = dynamic(() => import("./ChatPart/chatLayout"));

const { Content } = Layout;

const EmptyIntro = memo(() => {
	const { startNewConversation } = useConversationActions();

	const handleStartNewConversation = () => {
		startNewConversation();
	};

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
					onClick={handleStartNewConversation}
				>
					开启对话
				</Button>
				<Button
					type="default"
					className={styles["action-button"]}
					icon={<RightSquareOutlined />}
					onClick={() => message.info("敬请期待")}
				>
					学习用法
				</Button>
			</div>
		</div>
	);
});

EmptyIntro.displayName = "EmptyIntro";
const AuthPrompt = memo(() => (
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
));

AuthPrompt.displayName = "AuthPrompt";

const MainScreen = memo(() => {
	const isAuth = useAuthStore((state) => state.isAuthenticated);
	const conversations = useMultipleAgentStore((state) => state.conversations);

	if (!isAuth) return <AuthPrompt />;
	if (conversations.length >= 1) return <ChatArea />;
	return <EmptyIntro />;
});

MainScreen.displayName = "MainScreen";

const DoulbeAgentLayout = memo(() => {
	return (
		<MultiAgentChatProvider>
			<Layout style={{ flexDirection: "row" }} className="tight-container">
				<MultiAgentSideBar />
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
		</MultiAgentChatProvider>
	);
});

DoulbeAgentLayout.displayName = "DoulbeAgentLayout";

const useHasHydrated = () => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

function useHtmlLang() {
	useEffect(() => {
		const lang = getISOLang();
		const htmlLang = document.documentElement.lang;

		if (lang !== htmlLang) {
			document.documentElement.lang = lang;
		}
	}, []);
}

const App = () => {
	useHtmlLang();
	const hasHydrated = useHasHydrated();

	useEffect(() => {
		// console.log("[Config] got config from build time", getClientConfig());
		useAccessStore.getState().fetch();
	}, []);

	if (!hasHydrated) {
		return <Loading />;
	}

	return (
		<Router>
			<DoulbeAgentLayout />
		</Router>
	);
};

export default App;
