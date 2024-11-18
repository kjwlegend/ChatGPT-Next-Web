"use client";
require("@/app/polyfill");
import { useState, useEffect } from "react";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import styles from "./home.module.scss";
import sidebarStyles from "./sidebar/sidebar.module.scss";
import LoadingIcon from "@/app/icons/three-dots.svg";
import BotIcon from "@/app/icons/bot.svg";

import { getCSSVar } from "@/app/utils";

import dynamic from "next/dynamic";

import { Path, SlotID } from "@/app/constant";

import { getISOLang, getLang } from "@/app/locales";

import {
	HashRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar/sidebar";
import { useAppConfig } from "@/app/store/config";
import { getClientConfig } from "@/app/config/client";
import { api } from "@/app/client/api";
import { useAccessStore, useChatStore } from "@/app/store";
import ModalPopup from "@/app/components/welcome";
import useAuth from "@/app/hooks/useAuth";
import { log } from "console";
import { useAuthStore } from "@/app/store/auth";
import { message } from "antd";
import { SEOHeader } from "@/app/components/seo-header";

import ChatList from "./sidebar/chatList";

import { useChatService } from "@/app/(chat-pages)/chats/chat/hooks/useChatHook";
import { useAgentActions } from "@/app/hooks/useAgentActions";
import { useCheckCookieExpiration } from "@/app/hooks/useExpireCheck";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { refreshToken } from "@/app/services/api/user";
import { useTokenRefresh } from "@/app/hooks/useTokenRefresh";

function Loading(props: { noLogo?: boolean }) {
	return (
		<div className={styles["loading-content"] + " no-dark"}>
			{!props.noLogo && <BotIcon />}
			<LoadingIcon />
		</div>
	);
}

const Settings = dynamic(
	async () => (await import("./settings/settings")).Settings,
	{
		loading: () => <Loading noLogo />,
	},
);

const Chat = dynamic(async () => (await import("./chat/main")).Chat, {
	loading: () => <Loading noLogo />,
});

const NewChat = dynamic(
	async () => (await import("./new-chat/NewChat")).NewChat,
	{
		loading: () => <Loading noLogo />,
	},
);

const Knowledge = dynamic(async () => await import("./knowledge/main"), {
	loading: () => <Loading noLogo />,
});
const MaskPage = dynamic(async () => await import("./masklist/index"), {
	loading: () => <Loading noLogo />,
});

const Paitings = dynamic(
	async () => (await import("./paintings/main")).default,
	{
		loading: () => <Loading noLogo />,
	},
);

const Plugins = dynamic(
	async () => (await import("./settings/plugin")).PluginPage,
	{
		loading: () => <Loading noLogo />,
	},
);

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

const useHasHydrated = () => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

const loadAsyncGoogleFont = () => {
	const linkEl = document.createElement("link");
	const proxyFontUrl = "/google-fonts";
	const remoteFontUrl = "https://fonts.googleapis.com";
	const googleFontUrl =
		getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
	linkEl.rel = "stylesheet";
	linkEl.href =
		googleFontUrl +
		"/css2?family=" +
		encodeURIComponent("Noto Sans:wght@300;400;700;900") +
		"&display=swap";
	document.head.appendChild(linkEl);
};
function Screen() {
	const location = useLocation();
	const isAuth = location.pathname === Path.Auth;
	const isHome = location.pathname === Path.Home;
	const { logoutHook } = useAuth();
	const authStore = useAuthStore();
	const isAuthenticated = authStore.isAuthenticated;
	useTokenRefresh();

	const {
		loadMoreSessions,
		handleAddClick,
		handleChatItemClick,
		handleChatItemDelete,
	} = useChatService();

	const chatstore = useChatStore();
	const sessionlist = chatstore.sessions;
	const { onDelete, onChat } = useAgentActions();

	useEffect(() => {
		loadAsyncGoogleFont();
	}, []);

	return (
		<div
			className={
				styles.container +
				` ${styles["tight-container"]} ${
					getLang() === "ar" ? styles["rtl-screen"] : ""
				}`
			}
		>
			<>
				<SideBar
					className={isHome ? sidebarStyles["sidebar-show"] : ""}
					chatSessions={sessionlist}
					loadMoreSessions={loadMoreSessions}
					onAddClick={handleAddClick}
					onChatItemClick={handleChatItemClick}
					onChatItemDelete={handleChatItemDelete}
					ChatListComponent={ChatList}
				/>
				<div className={styles["window-content"]} id={SlotID.AppBody}>
					<Routes>
						<Route path={Path.Home} element={<NewChat />} />
						<Route path={Path.NewChat} element={<NewChat />} />
						<Route path={Path.Knowledge} element={<Knowledge />} />
						<Route path={Path.Paintings} element={<Paitings />} />
						<Route
							path={Path.Masks}
							element={<MaskPage onItemClick={onChat} onDelete={onDelete} />}
						/>
						<Route path={Path.Plugins} element={<Plugins />} />
						<Route path={Path.Chat} element={<Chat />} />
						<Route path={Path.Settings} element={<Settings />} />
					</Routes>
					<ModalPopup />
				</div>
			</>
		</div>
	);
}

function useLoadData() {
	const config = useAppConfig();

	useEffect(() => {
		(async () => {
			const models = await api.llm.models();
			config.mergeModels(models);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}

const Home = () => {
	useSwitchTheme();
	useLoadData();
	useHtmlLang();
	useCheckCookieExpiration(); // 直接调用 hook

	const [messageApi, contextHolder] = message.useMessage();

	useEffect(() => {
		console.log("[Config] got config from build time", getClientConfig());
		useAccessStore.getState().fetch();
	}, []);

	if (!useHasHydrated()) {
		return <Loading />;
	}

	return (
		<Router>
			<SEOHeader />
			<Screen />
			{contextHolder}
		</Router>
	);
};

export default Home;
