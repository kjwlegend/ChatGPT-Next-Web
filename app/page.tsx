"use client";
import About from "./about/page";
import { getServerSideConfig } from "./config/server";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInviteCodeStore } from "./store/auth";
import Header from "./components/header";
import Footer from "./components/footer";
import Head from "next/head";
const serverConfig = getServerSideConfig();

export default function App() {
	const query = useSearchParams();

	const inviteCode = query.get("i");
	const inviteCodeStore = useInviteCodeStore();

	useEffect(() => {
		// 在这里可以使用inviteCode进行相应的处理
		console.log("inviteCode", inviteCode);

		inviteCodeStore.setInviteCode(inviteCode);
	}, [inviteCode]);

	return (
		<>
			<Head>
				<title>小光AI -更新日志 | 专业提示词工程师打造</title>
				<meta
					name="description"
					content="小光AI, 由专业提示词工程师打造的AIGC 工具, 专注于文案, 工作流, multi-agents 的人工智能工具, 为您提供最优质的AI服务."
				/>
				<meta name="keywords" content="小光AI, chatgpt, AIGC" />
			</Head>
			<About />
		</>
	);
}
