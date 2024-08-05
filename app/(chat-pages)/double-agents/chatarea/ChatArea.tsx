// src/components/ChatArea/ChatArea.tsx
"use client";
import React, { useEffect } from "react";
import { Row, Col } from "antd";
// import AIConfigPanel from "./AIConfigPanel";
// import ConversationWindow from "./ConversationWindow";
import dynamic from "next/dynamic";
import { startConversation } from "@/app/services/doubleAgentService";
import useDoubleAgentStore from "@/app/store/doubleAgents";
import { useChatStore, useUserStore } from "@/app/store";

const AIConfigPanel = dynamic(async () => await import("./AIConfigPanel"), {
	ssr: false,
});
const ConversationWindow = dynamic(
	async () => await import("./ConversationWindow"),
	{
		ssr: false,
	},
);

const ChatArea: React.FC = () => {
	useEffect(() => {}, []);
	return (
		<Row gutter={16}>
			<Col span={6}>
				<AIConfigPanel side="left" key={"left"} />
			</Col>
			<Col span={12}>
				<ConversationWindow />
			</Col>
			<Col span={6}>
				<AIConfigPanel side="right" key={"right"} />
			</Col>
		</Row>
		// </>
	);
};

export default ChatArea;
