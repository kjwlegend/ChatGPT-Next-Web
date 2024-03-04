/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import "./styles/layout.scss";
import { getClientConfig } from "./config/client";
import Header from "./components/header";
import Footer from "./components/footer";
import { type Metadata, type Viewport } from "next";
import { version } from "./constant";

import Script from "next/script";
export const metadata: Metadata = {
	title: "小光AI",
	description:
		"小光AI, 由专业提示词工程师打造的集成聊天, 角色扮演, 面具, 预设, 代码解释器于一体的聊天机器人",
	authors: [{ name: "绝望的光 @ 56349014" }],
	applicationName: "小光AI v" + version,
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fafafa" },
		// { media: "(prefers-color-scheme: dark)", color: "#151515" },
	],
};
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta name="config" content={JSON.stringify(getClientConfig())} />
				<meta httpEquiv="pragma" content="no-cache" />
				<meta httpEquiv="cache-control" content="no-cache" />
				<meta httpEquiv="expires" content="0" />
				<link rel="manifest" href="/site.webmanifest"></link>

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
					<Header />
					{children}
					<Footer />
				</section>
			</body>

			<script
				async
				src="https://www.googletagmanager.com/gtag/js?id=G-2RS8HX8937"
			></script>
		</html>
	);
}
