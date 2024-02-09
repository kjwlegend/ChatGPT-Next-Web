"use client";
import React, { use, useState } from "react";
import { useEffect } from "react";
import { Button, Layout } from "antd";
// import Sidebar from "./components/Sidebar";
import ChatArea from "./chatarea/ChatArea";
import { SideBar } from "../chats/sidebar/sidebar";
import { Path, SlotID } from "../constant";
import styles from "./double-agents.module.scss";
import {
	HashRouter as Router,
	Routes,
	Route,
	useLocation,
	NavigationType,
} from "react-router-dom";

import usedoubleAgentStore from "@/app/store/doubleAgents";
import { DoubleAgentChatSession } from "@/app/store/doubleAgents";
import { useUserStore } from "../store";

// import Footer from "./components/Footer";

const { Header, Content, Sider, Footer } = Layout;

const App: React.FC = () => {
	const doubleagents = usedoubleAgentStore();
	const userid = useUserStore.getState().user.id;

	const { conversations, startNewConversation, setCurrentConversationId } =
		doubleagents;

	// 避免服务器端渲染, 采用客户端渲染
	const [localconversations, setLocalConversations] = useState<
		DoubleAgentChatSession[]
	>([]);

	const defaultTopic = "未定义话题";

	useEffect(() => {
		setLocalConversations(conversations);
	}, [conversations]);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{/* <Sidebar /> */}
			<Layout>
				{/* <Header>Header</Header> */}
				<Sider width={250} collapsible={true} theme="light">
					<Button onClick={() => startNewConversation(defaultTopic, userid)}>
						Start New Conversation
					</Button>
					{localconversations.map((conversation: any) => {
						return (
							<div
								key={conversation.id}
								onClick={() => {
									setCurrentConversationId(conversation.id);
									console.log(conversation.id);
								}}
							>
								{conversation.topic}
							</div>
						);
					})}
				</Sider>

				<Content id={SlotID.AppBody}>
					<ChatArea />
				</Content>
				{/* <Footer /> */}
			</Layout>
		</Layout>
	);
};

export default App;
