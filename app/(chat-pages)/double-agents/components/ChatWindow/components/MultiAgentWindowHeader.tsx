import React from "react";
import { Typography, Space, message, InputNumber, Tooltip } from "antd";
import {
	ReloadOutlined,
	PauseOutlined,
	CaretRightOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { useMultipleAgentStore } from "@/app/store/multiagents/index";
import { continueConversation } from "../../../service/MultiAgentService";
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MultiAgentWindowHeader: React.FC = () => {
	const multiAgentStore = useMultipleAgentStore.getState();
	const [messageApi, contextHolder] = message.useMessage();
	const session = multiAgentStore.currentSession();

	if (!session) {
		return null;
	}

	const handleRestart = () => {
		multiAgentStore.clearConversation(session.id);
	};

	const handlePauseResume = () => {
		const newPausedState = !session.paused;
		multiAgentStore.updateMultiAgentsChatsession(session.id, {
			paused: newPausedState,
		});

		if (!newPausedState) {
			continueConversation(session.id, session.round);
		}
	};

	const handleRoundChange = (value: number | null) => {
		if (value === null) return;
		const updatedSession = { ...session, totalRounds: value };
		multiAgentStore.updateConversation(session.id, updatedSession);
	};

	return (
		<div className="flex items-center justify-between border-b border-border p-4">
			{contextHolder}
			<div className="space-between flex flex-1 items-center justify-between gap-4">
				<HoverCard>
					<HoverCardTrigger>
						<h2 className="max-w-[300px] truncate text-xl font-semibold transition-colors hover:text-primary">
							{session.topic}
						</h2>
					</HoverCardTrigger>
					<HoverCardContent className="w-[50vw] p-4">
						<div className="space-y-2">
							<div className="font-medium">标题: {session.topic}</div>
							<div className="text-sm text-muted-foreground">
								摘要: {session.memory}
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>

				<div className="flex items-center gap-2">
					<Label>总轮数</Label>
					<Input
						type="number"
						min={0}
						value={session.totalRounds}
						onChange={(e) => handleRoundChange(Number(e.target.value))}
						className="w-20"
					/>
					<span className="text-sm text-muted-foreground">
						当前第 {session.round} 轮
					</span>

					<Button variant="outline" size="icon" onClick={handleRestart}>
						<DeleteOutlined className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="icon" onClick={handlePauseResume}>
						{session.paused ? (
							<CaretRightOutlined className="h-4 w-4" />
						) : (
							<PauseOutlined className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default MultiAgentWindowHeader;
