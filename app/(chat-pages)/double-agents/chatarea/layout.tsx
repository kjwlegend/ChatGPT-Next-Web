// src/components/ChatArea/ChatArea.tsx
"use client";
import React, { useEffect } from "react";
import { Row, Col } from "antd";

import dynamic from "next/dynamic";

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
				<AIConfigPanel />
			</Col>
			<Col span={18}>
				<ConversationWindow />
			</Col>
		</Row>
		// </>
	);
};

export default ChatArea;
