"use client";

require("../polyfill");

import { useState, useEffect } from "react";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import styles from "./home.module.scss";
import LoadingIcon from "../icons/three-dots.svg";
import BotIcon from "../icons/bot.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";

import { Path, SlotID } from "../constant";

import { getISOLang, getLang } from "../locales";

import {
	HashRouter as Router,
	Routes,
	Route,
	useLocation,
	NavigationType,
} from "react-router-dom";
import { SideBar } from "./sidebar/sidebar";
import { useAppConfig } from "../store/config";
import AuthPage from "../auth/page";
import { getClientConfig } from "../config/client";
import { api } from "../client/api";
import { useAccessStore } from "../store";
import ModalPopup from "@/app/components/welcome";
import useAuth from "../hooks/useAuth";
import { log } from "console";
import { useAuthStore } from "../store/auth";
import { message } from "antd";
// import { NewChat } from "./new-chat";

function Loading(props: { noLogo?: boolean }) {
	return (
		<div className={styles["loading-content"] + " no-dark"}>
			{!props.noLogo && <BotIcon />}
			<LoadingIcon />
		</div>
	);
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
	loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat/main")).Chat, {
	loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
	loading: () => <Loading noLogo />,
});

const Knowledge = dynamic(async () => await import("./knowledge/main"), {
	loading: () => <Loading noLogo />,
});
const MaskPage = dynamic(
	async () => (await import("./masklist/mask")).MaskPage,
	{
		loading: () => <Loading noLogo />,
	},
);

const Paitings = dynamic(
	async () => (await import("./paintings/main")).default,
	{
		loading: () => <Loading noLogo />,
	},
);

const Plugins = dynamic(async () => (await import("./plugin")).PluginPage, {
	loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
	const config = useAppConfig();

	useEffect(() => {
		document.body.classList.remove("light");
		document.body.classList.remove("dark");

		// if (config.theme === "dark") {
		//   document.body.classList.add("dark");
		// } else if (config.theme === "light") {
		//   document.body.classList.add("light");
		// }

		const metaDescriptionDark = document.querySelector(
			'meta[name="theme-color"][media*="dark"]',
		);
		const metaDescriptionLight = document.querySelector(
			'meta[name="theme-color"][media*="light"]',
		);

		// if (config.theme === "auto") {
		//   metaDescriptionDark?.setAttribute("content", "#151515");
		//   metaDescriptionLight?.setAttribute("content", "#fafafa");
		// } else {
		//   const themeColor = getCSSVar("--theme-color");
		//   metaDescriptionDark?.setAttribute("content", themeColor);
		//   metaDescriptionLight?.setAttribute("content", themeColor);
		// }
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
	const config = useAppConfig();
	const location = useLocation();
	const isAuth = location.pathname === Path.Auth;
	const isHome = location.pathname === Path.Home;
	const isMobileScreen = useMobileScreen();
	const { logoutHook } = useAuth();
	const authStore = useAuthStore();
	const isAuthenticated = authStore.isAuthenticated;
	console.log("ishome", isHome);

	getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

	useEffect(() => {
		loadAsyncGoogleFont();
	}, []);

	// 检查当前的 cookie 中的 expires=xxx 是否已经过期
	// 如果过期了，就清除掉当前的 cookie 并执行logouthook
	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}
		const cookie = document.cookie;
		console.log("cookie", cookie);
		const cookieArr = cookie.split(";");
		const cookieObj: any = {};
		cookieArr.forEach((item) => {
			const itemArr = item.split("=");
			cookieObj[itemArr[0].trim()] = itemArr[1];
		});
		const expires = cookieObj.expires;
		const expiresTimeStamp = Date.parse(expires);
		const currentTimeStamp = Date.now();
		console.log("expiresTimeStamp", expiresTimeStamp);
		if (currentTimeStamp > expiresTimeStamp && expiresTimeStamp != null) {
			console.log("cookie已过期");
			message.error("登录已过期，请重新登录");
			logoutHook()
				.then(() => {
					// window.location.reload();
				})
				.catch((e) => {
					console.log("logout error", e);
				});

			// window.location.reload();
		}
	});

	return (
		<div
			className={
				styles.container +
				` ${styles["tight-container"]} ${
					getLang() === "ar" ? styles["rtl-screen"] : ""
				}`
			}
		>
			{isAuth ? (
				<>
					<AuthPage />
				</>
			) : (
				<>
					<SideBar className={isHome ? styles["sidebar-show"] : ""} />
					<div className={styles["window-content"]} id={SlotID.AppBody}>
						<Routes>
							<Route path={Path.Home} element={<NewChat />} />
							<Route path={Path.NewChat} element={<NewChat />} />
							<Route path={Path.Knowledge} element={<Knowledge />} />
							<Route path={Path.Paintings} element={<Paitings />} />
							<Route path={Path.Masks} element={<MaskPage />} />
							<Route path={Path.Plugins} element={<Plugins />} />
							<Route path={Path.Chat} element={<Chat />} />
							<Route path={Path.Settings} element={<Settings />} />
						</Routes>
						<ModalPopup />
					</div>
				</>
			)}
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

export default function Home() {
	useSwitchTheme();
	useLoadData();
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
			<Screen />
		</Router>
	);
}
