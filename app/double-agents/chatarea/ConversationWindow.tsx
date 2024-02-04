// src/components/ChatArea/ConversationWindow.tsx
"use client";
import React, { useEffect } from "react";
import { Card, Input, Button } from "antd";
import { Chat } from "@/app/chats/chat";
import dynamic from "next/dynamic";
import useDoubleAgentStore from "@/app/store/doubleAgents";
import { useChatStore, useUserStore } from "@/app/store";
import { startConversation } from "@/app/services/doubleAgentService";

const { TextArea } = Input;

const Chatbody = dynamic(
	async () => (await import("@/app/chats/chat/Chatbody")).DoubleAgentChatbody,
	{
		ssr: false,
	},
);
const Inputpanel = dynamic(
	async () => (await import("@/app/chats/chat/Inputpanel")).Inputpanel,
	{
		ssr: false,
	},
);

const ConversationWindow: React.FC = () => {
	const {
		conversations,
		startNewConversation,
		setCurrentConversationId,
		setAIConfig,
		clearAIConfig,
	} = useDoubleAgentStore();
	const currentConversationId = useDoubleAgentStore().currentConversationId;
	const userid = useUserStore.getState().user.id;

	useEffect(() => {
		// 这里可以做一些初始化的工作
	}, []);

	const startConversationHandler = () => {
		// 开始对话
		const topic = "测试对话";
		const userId = 1;
		const initialinput = "你好";
		startConversation(startNewConversation, topic, initialinput, userId);
	};
	return (
		<Card
			title={`对话窗口 ${currentConversationId}`}
			extra={
				<div style={{ marginTop: 16 }}>
					<Button onClick={startConversationHandler} type="primary">
						开始
					</Button>
					<Button style={{ marginLeft: 8 }}>暂停</Button>
					<Button style={{ marginLeft: 8 }}>继续</Button>
				</div>
			}
		>
			<div style={{ marginBottom: 16 }}>
				{/* 消息展示区域 */}
				<div
					style={{
						height: "60vh",
						overflowY: "auto",
					}}
				>
					{/* 这里渲染对话内容 */}
					<Chatbody />
				</div>
				{/* 控制器 */}

				{/* 自动对话轮数输入 */}
				<div style={{ marginTop: 16 }}>
					<Input addonBefore="轮数" defaultValue="3" />
				</div>
				{/* 初始输入 */}
				<div style={{ marginTop: 16 }}>
					<Inputpanel />
				</div>
			</div>
		</Card>
	);
};

export default ConversationWindow;
