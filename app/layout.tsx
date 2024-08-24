/* eslint-disable @next/next/no-page-custom-font */
"use client";
import React, { useEffect } from "react";
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import "./styles/layout.scss";
import { getClientConfig } from "./config/client";
import Header from "./components/header";
import Footer from "./components/footer";
import { version } from "./constant";
import { Button, ConfigProvider, ThemeConfig, theme } from "antd";
import Script from "next/script";

import { useAppConfig } from "./store";
import { SEOHeader } from "./components/seo-header";

import { type Metadata, type Viewport } from "next";

// export const metadata: Metadata = {
// 	title: "小光AI",
// 	description:
// 		"小光AI, 由专业提示词工程师打造的AIGC 工具, 专注于文案, 工作流, multi-agents 的人工智能工具, 为您提供最优质的AI服务.",
// 	authors: [{ name: "绝望的光 @ 56349014" }],
// 	keywords: ["小光AI", "chatgpt", "AIGC"],
// };

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fafafa" },
		{ media: "(prefers-color-scheme: dark)", color: "#151515" },
	],
};

const lightTheme: ThemeConfig = {
	token: {},
};

const darkTheme: ThemeConfig = {
	token: {
		borderRadius: 5,
		// colorPrimary: "#102c53",
		colorPrimary: "#cbdfff",
		// colorPrimary: "#664eb5",

		colorText: "rgba(255, 255, 255, 0.88)",
		colorTextQuaternary: "#6c6666",
	},

	components: {
		Button: {
			colorPrimary: "#664eb5",
			colorPrimaryHover: "#664eaa",
			colorLink: "#d1c4ff",
			algorithm: true,
		},
		Switch: {
			handleBg: "#fff",
			// colorTextQuaternary: "rgba(11, 9, 9, 0.25)",
			// colorTextTertiary: "rgba(98, 185, 218, 0.45)",
			colorPrimary: "#664eb5",
			algorithm: true,
		},
		Form: {
			labelColor: "rgba(255, 255, 255, 0.88)",
			colorText: "rgba(255, 255, 255, 0.88)",
		},

		Input: {
			colorIcon: "rgba(247, 247, 247, 0.45)",
			colorBgContainer: "rgb(37, 34, 76)",
			algorithm: true,
			activeBg: "rgba(37, 34, 76, 0.74)",
			colorIconHover: "rgba(253, 253, 253, 0.88)",
			colorText: "rgba(255, 255, 255, 0.88)",
			colorTextDescription: "rgba(255, 255, 255, 0.45)",
			colorTextPlaceholder: "rgba(255, 255, 255, 0.46)",
		},
		Tabs: {
			inkBarColor: "rgb(114, 46, 209)",
			itemActiveColor: "#9bb3ff",
			itemColor: "rgb(164 169 175)",
			itemHoverColor: "rgb(114, 46, 209)",
			itemSelectedColor: "#9bb3ff",
			cardBg: "rgb(37, 34, 76)",
		},
		Checkbox: {
			colorText: "rgba(255, 255, 255, 0.88)",
			colorTextDescription: "rgba(255, 255, 255, 0.45)",
			colorTextPlaceholder: "rgba(255, 255, 255, 0.46)",
			colorIcon: "rgba(247, 247, 247, 0.45)",
			colorIconHover: "rgba(253, 253, 253, 0.88)",
			colorBgContainer: "rgb(37, 34, 76)",
			colorPrimary: "#664eb5",
			algorithm: true,
		},
		Segmented: {
			itemSelectedBg: "rgb(108, 97, 165)",
			itemSelectedColor: "rgb(220, 220, 220)",
			itemHoverBg: "rgba(139, 125, 212, 0.61)",
			trackBg: "#afacc2",
		},
		Tag: {
			defaultBg: "rgb(37, 34, 76)",
			colorPrimary: "rgb(108, 97, 165)",
			colorText: "rgba(255, 255, 255, 0.45)",
			colorPrimaryActive: "rgb(108, 97, 165)",
			colorPrimaryHover: "rgb(108, 97, 195)",
		},
		Modal: {
			contentBg: "rgb(37, 34, 76)",
		},
		Select: {
			colorBgContainer: "rgb(28, 32, 54)",
			colorText: "rgba(255, 255, 255, 0.88)",
			colorBgElevated: "rgb(37, 34, 76)",
			optionSelectedBg: "rgb(108, 97, 165)",
		},
		Message: {
			contentBg: "rgb(37, 34, 76)",
		},
		Dropdown: {
			colorText: "rgba(255, 255, 255, 0.88)",
			colorBgElevated: "rgb(37, 34, 76)",
			colorPrimary: "#664eb5",
		},
		Drawer: {
			colorBgElevated: "rgb(37, 34, 76)",
			colorIcon: "rgba(247, 247, 247, 0.45)",
			colorText: "rgba(255, 255, 255, 0.88)",
		},
		Menu: {
			colorBgElevated: "rgb(37, 34, 76)",
			colorText: "rgba(255, 255, 255, 0.88)",
			itemBg: "rgb(37, 34, 76)",
		},
		Radio: {
			buttonBg: "rgb(37, 34, 76)",
			buttonCheckedBg: "rgb(108, 97, 165)",
		},
		Table: {
			colorBgContainer: "#1c2036",
			colorText: "rgba(255, 255, 255, 0.88)",
			headerBg: "rgb(37, 34, 76)",
		},
		Popover: {
			colorBgElevated: "rgb(37, 34, 76)",
			colorText: "rgba(255, 255, 255, 0.88)",
		},
	},
};
import Head from "next/head";
import { useMobileScreen } from "./hooks/useMobileScreen";
import { AppGeneralContext } from "./contexts/AppContext";
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// get theme from viewpoint meta

	const config = useAppConfig();
	const updateConfig = config.update;
	const theme = config.theme === "dark" ? darkTheme : lightTheme;

	const isMobile = useMobileScreen();
	console.log("ismobile", isMobile);

	return (
		<html lang="en">
			<head>
				<SEOHeader />

				<meta name="config" content={JSON.stringify(getClientConfig())} />
				<meta httpEquiv="pragma" content="no-cache" />
				<meta httpEquiv="cache-control" content="no-cache" />
				<meta httpEquiv="expires" content="0" />
				<link rel="manifest" href="/site.webmanifest"></link>
				{/* import css */}

				<script src={"/serviceWorkerRegister.js?v=" + version} defer></script>
				<script
					async
					src={
						"https://jic.talkingdata.com/app/h5/v1?appid=EF569EDD56B64DEEB3BF84539A707729&vn=公测版&vc=" +
						version
					}
				></script>

				<script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-2RS8HX8937"
				></script>

				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());

						gtag('config', 'G-2RS8HX8937');
						`}
				</Script>
			</head>
			<body>
				<section className="appcontainer">
					<AppGeneralContext.Provider
						value={{
							isMobile,
						}}
					>
						<ConfigProvider theme={theme}>
							<Header />
							{children}
							<Footer />
						</ConfigProvider>
					</AppGeneralContext.Provider>
				</section>
			</body>

			<script
				async
				src="https://www.googletagmanager.com/gtag/js?id=G-2RS8HX8937"
			></script>
		</html>
	);
}
