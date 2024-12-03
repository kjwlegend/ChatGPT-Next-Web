// src/components/ChatArea/ChatArea.tsx
"use client";
import React, { useEffect } from "react";
import { Row, Col } from "antd";

import dynamic from "next/dynamic";

const AIConfigPanel = dynamic(
	async () => await import("../AgentConfig/AIConfigPanel"),
	{
		ssr: false,
	},
);
const ConversationWindow = dynamic(
	async () => await import("./ConversationWindow"),
	{
		ssr: false,
	},
);

const ChatArea: React.FC = () => {
	return (
		<Row gutter={16} style={{ height: "100%" }}>
			<Col span={6}>
				<AIConfigPanel />
			</Col>
			<Col span={18} style={{ height: "100%" }}>
				<ConversationWindow />
			</Col>
		</Row>
	);
};

export default ChatArea;
