// src/components/ChatArea/ConversationWindow.tsx
"use client";
import React, { useEffect } from "react";
import { Card, Input, Button } from "antd";
import { Chat } from "@/app/chats/chat";
import dynamic from "next/dynamic";
import useDoubleAgentStore from "@/app/store/doubleAgents";
import { useChatStore, useUserStore } from "@/app/store";
import { startConversation } from "@/app/services/doubleAgentService";
import { DoubleAgentWindowHeader } from "@/app/chats/chat/WindowHeader";
import styles from "@/app/chats/home.module.scss";
const { TextArea } = Input;

const Chatbody = dynamic(
	async () => (await import("@/app/chats/chat/Chatbody")).DoubleAgentChatbody,
	{
		ssr: false,
	},
);
const Inputpanel = dynamic(
	async () => (await import("@/app/chats/chat/Inputpanel")).DoubleAgentInput,
	{
		ssr: false,
	},
);

const ConversationWindow: React.FC = () => {
	const { conversations } = useDoubleAgentStore();
	const currentConversationId = useDoubleAgentStore().currentConversationId;
	const conversation = conversations.find(
		(conversation) => conversation.id === currentConversationId,
	);
	const userid = useUserStore.getState().user.id;

	useEffect(() => {
		// 这里可以做一些初始化的工作
	}, []);

	return (
		<Card bodyStyle={{ padding: 0 }} style={{ height: "100%" }}>
			<DoubleAgentWindowHeader session={conversation} />
			<div style={{ marginBottom: 16 }}>
				{/* 消息展示区域 */}
				{/* 这里渲染对话内容 */}
				<Chatbody />

				{/* 初始输入 */}
				<div style={{ marginTop: 16 }}>
					<Inputpanel />
				</div>
			</div>
		</Card>
	);
};

export default ConversationWindow;
