// src/components/ChatArea/ConversationWindow.tsx
"use client";
import React, { useEffect } from "react";
import { Card, Input, Button } from "antd";
import dynamic from "next/dynamic";
import useDoubleAgentStore from "@/app/store/doubleAgents";
import { useChatStore, useUserStore } from "@/app/store";
import { startConversation } from "@/app/services/doubleAgentService";
import { DoubleAgentWindowHeader } from "@/app/chats/chat/WindowHeader";
import styles from "@/app/chats/home.module.scss";
import Image from "next/image";
import { PlusCircleFilled, PlusCircleOutlined } from "@ant-design/icons";
import { useDoubleAgentChatContext } from "../doubleAgentContext";
const { TextArea } = Input;

const Chatbody = dynamic(
	async () => (await import("../components/Chatbody")).DoubleAgentChatbody,
	{
		ssr: false,
	},
);
const Inputpanel = dynamic(
	async () => (await import("../components/input")).DoubleAgentInput,
	{
		ssr: false,
	},
);

const ConversationWindow: React.FC = () => {
	const { conversation, startNewConversation } = useDoubleAgentChatContext();

	const userid = useUserStore.getState().user.id;
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
				<Card bodyStyle={{ padding: 0 }} style={{ height: "100%" }}>
					<DoubleAgentWindowHeader session={conversation} />
					<div style={{ marginBottom: 16 }}>
						<Chatbody _session={conversation} />
						{/* 初始输入 */}
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
