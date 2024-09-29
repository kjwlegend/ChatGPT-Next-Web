import React from "react";
import {
	Typography,
	Space,
	Button,
	Select,
	message,
	InputNumber,
	Tooltip,
} from "antd";
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
import { useCurrentConversation } from "../../multiAgentContext";

const { Title } = Typography;
const { Option } = Select;

const MultiAgentWindowHeader: React.FC = () => {
	const multiAgentStore = useMultipleAgentStore.getState();
	const [messageApi, contextHolder] = message.useMessage();
	const { conversation: session } = useCurrentConversation();

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

	const handleModeChange = (
		value: "round-robin" | "random" | "intelligent",
	) => {
		multiAgentStore.updateMultiAgentsChatsession(session.id, {
			next_agent_type: value,
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
					<Tooltip
						title={`标题: ${session.topic}  \n\n 摘要: ${session.memory}`}
						overlayStyle={{
							width: "50vw",
							maxWidth: "unset",
						}}
						overlayInnerStyle={{
							fontSize: "14px",
							lineHeight: "1.5",
							letterSpacing: "0.5px",
						}}
					>
						<p className={styles.title}>{session.topic}</p>
					</Tooltip>
				</div>
				<div className={styles.infoRow}>
					<Space>
						<InputNumber
							min={0}
							value={session.totalRounds}
							onChange={handleRoundChange}
							addonBefore="总轮数"
							addonAfter={`当前第 ${session.round} 轮`}
							style={{ width: 220 }}
						/>
						<Select
							value={session.next_agent_type}
							onChange={handleModeChange}
							className={styles.modeSelector}
						>
							<Option value="round-robin">顺序模式</Option>
							<Option value="random">随机模式</Option>
							<Option value="intelligent" disabled>
								智能决策
							</Option>
						</Select>
						<div className={styles.buttonGroup}>
							<Button icon={<DeleteOutlined />} onClick={handleRestart}>
								重新开始
							</Button>
							<Button
								icon={
									session.paused ? <CaretRightOutlined /> : <PauseOutlined />
								}
								onClick={handlePauseResume}
							>
								{session.paused ? "继续" : "暂停"}
							</Button>
						</div>
					</Space>
				</div>
			</div>
		</div>
	);
};

export default MultiAgentWindowHeader;
