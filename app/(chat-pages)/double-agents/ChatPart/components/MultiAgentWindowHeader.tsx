import React from "react";
import { Typography, Space, Button, Select, message, InputNumber } from "antd";
import {
	ReloadOutlined,
	PauseOutlined,
	CaretRightOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import {
	MultiAgentChatSession,
	useMultipleAgentStore,
} from "@/app/store/multiagents";
import { continueConversation, decideNextAgent } from "../../MultiAgentService";
import styles from "../../multi-agents.module.scss";

const { Title } = Typography;
const { Option } = Select;

interface MultiAgentWindowHeaderProps {
	session: MultiAgentChatSession;
	onModeChange: (mode: "round-robin" | "random" | "intelligent") => void;
}

const MultiAgentWindowHeader: React.FC<MultiAgentWindowHeaderProps> = ({
	session,
}) => {
	const multiAgentStore = useMultipleAgentStore();
	const [messageApi, contextHolder] = message.useMessage();

	const handleRestart = () => {
		multiAgentStore.clearConversation(session.id);
	};

	const handlePauseResume = () => {
		const newPausedState = !session.paused;
		const updatedSession = { ...session, paused: newPausedState };
		multiAgentStore.updateConversation(session.id, updatedSession);

		if (!newPausedState) {
			continueConversation(session.id, session.round);
		}
	};

	const handleModeChange = (
		value: "round-robin" | "random" | "intelligent",
	) => {
		const next_agent_type = value;
		multiAgentStore.updateMultiAgentsChatsession(session.id, {
			next_agent_type,
		});
	};

	const handleRoundChange = (value: number | null) => {
		if (value === null) return;
		const updatedSession = { ...session, totalRounds: value };
		multiAgentStore.updateConversation(session.id, updatedSession);
	};

	return (
		<div className={styles.windowHeader}>
			{contextHolder}
			<div className={styles.headerContent}>
				<div className={styles.topRow}>
					<Title level={4} className={styles.title}>
						{session.topic}
					</Title>
					<div className={styles.buttonGroup}>
						<Button icon={<DeleteOutlined />} onClick={handleRestart}>
							重新开始
						</Button>
						<Button
							icon={session.paused ? <CaretRightOutlined /> : <PauseOutlined />}
							onClick={handlePauseResume}
						>
							{session.paused ? "继续" : "暂停"}
						</Button>
					</div>
				</div>
				<div className={styles.infoRow}>
					<Space>
						<InputNumber
							min={0}
							value={session.totalRounds}
							onChange={handleRoundChange}
							addonBefore="总轮数"
							addonAfter={`当前第 ${session.round} 轮`}
							style={{ width: 200 }}
						/>
						<Select
							value={session.next_agent_type}
							onChange={handleModeChange}
							className={styles.modeSelector}
						>
							<Option value="round-robin">顺序模式</Option>
							<Option value="random">随机模式</Option>
							<Option value="intelligent">智能决策</Option>
						</Select>
					</Space>
				</div>
			</div>
		</div>
	);
};

export default MultiAgentWindowHeader;
