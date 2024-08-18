// src/components/ChatArea/ConversationWindow.tsx
"use client";
import React, { useEffect } from "react";
import { Card, Input, Button } from "antd";
import dynamic from "next/dynamic";
import usemultiAgentStore from "@/app/store/multiagents";
import { useChatStore, useUserStore } from "@/app/store";
import { startConversation } from "@/app/services/MultiAgentService";
import { MultiAgentWindowHeader } from "@/app/(chat-pages)/chats/chat/WindowHeader";
import styles from "@/app/(chat-pages)/chats/home.module.scss";
import Image from "next/image";
import { PlusCircleFilled, PlusCircleOutlined } from "@ant-design/icons";
import { useMultiAgentChatContext } from "../multiAgentContext";
const { TextArea } = Input;

const Chatbody = dynamic(
	async () => (await import("../components/Chatbody")).MultiAgentChatbody,
	{
		ssr: false,
	},
);
const Inputpanel = dynamic(
	async () => (await import("../components/input")).MultiAgentInput,
	{
		ssr: false,
	},
);

const ConversationWindow: React.FC = () => {
	const { conversation, startNewConversation } = useMultiAgentChatContext();

	const [shouldRender, setShouldRender] = React.useState(false);
	useEffect(() => {
		// 这里可以做一些初始化的工作
		if (conversation) {
			setShouldRender(true);
		}
	}, [conversation]);

	return (
		<>
			{shouldRender && conversation ? (
				<Card
					style={{ height: "100%" }}
					styles={{
						body: {
							padding: 0,
						},
					}}
				>
					<MultiAgentWindowHeader session={conversation} />
					<div style={{ marginBottom: 16 }}>
						<Chatbody _session={conversation} />
						<div style={{ marginTop: 16 }}>
							<Inputpanel />
						</div>
					</div>
				</Card>
			) : null}
		</>
	);
};

export default ConversationWindow;
