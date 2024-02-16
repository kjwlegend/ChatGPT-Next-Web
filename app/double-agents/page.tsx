"use client";
import React, { use, useState, useCallback } from "react";
import { useEffect } from "react";
import { Button, Layout, message } from "antd";
// import Sidebar from "./components/Sidebar";
import ChatArea from "./chatarea/ChatArea";
import { Path, SlotID } from "../constant";
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
import { useUserStore } from "../store";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
	LeftSquareOutlined,
	PlusCircleOutlined,
	RightSquareOutlined,
} from "@ant-design/icons";
const DoubleAgentSideBar = dynamic(
	async () => (await import("./components/sidebar")).DoubleAgentSideBar,
	{
		loading: () => null,
		ssr: false,
	},
);
// import Footer from "./components/Footer";

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

const App: React.FC = () => {
	const doubleagents = usedoubleAgentStore();
	const userid = useUserStore.getState().user.id;

	const { conversations, currentConversationId, setCurrentConversationId } =
		doubleagents;

	// 避免服务器端渲染, 采用客户端渲染
	const [localconversations, setLocalConversations] = useState<
		DoubleAgentChatSession[]
	>([]);

	useEffect(() => {
		setLocalConversations(conversations);
	}, [conversations]);

	return (
		<DoubleAgentChatProvider>
			<Layout style={{ flexDirection: "row" }}>
				<DoubleAgentSideBar />

				<Layout
					className={`${styles2["window-content"]} ${styles["background"]}`}
				>
					<Content id={SlotID.AppBody}>
						{localconversations.length >= 1 ? <ChatArea /> : <EmptyIntro />}
					</Content>
				</Layout>
			</Layout>
		</DoubleAgentChatProvider>
	);
};

export default App;
