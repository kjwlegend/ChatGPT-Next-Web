"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	use,
	useContext,
} from "react";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { HashRouter } from "react-router-dom";
import { useChatStore, useUserStore } from "../../store";
import { ChatControllerPool } from "../../client/controller";
import { Prompt, usePromptStore } from "../../store/prompt";
import { useMaskStore } from "../../store/mask";
import Locale, { Lang } from "../../locales";

import LoadingIcon from "@/app/icons/three-dots.svg";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
	WorkflowContext,
	WorkflowProvider,
	useWorkflowContext,
} from "./workflowContext";

import { createWorkflowSession } from "../../api/backend/chat";

import styles from "./workflow-chats.module.scss";
import styles2 from "@/app/(chat-pages)/chats/home.module.scss";
import {
	Avatar as UserAvatar,
	Button,
	Menu,
	Dropdown,
	Switch,
	Layout,
	Flex,
} from "antd";

import { _Chat } from "@/app/(chat-pages)/chats/chat/main";

import { useWorkflowStore } from "../../store/workflow";
import { useAuthStore } from "../../store/auth";
import { WorkflowSidebar } from "./sidebar";
import { message } from "antd";
import Image from "next/image";

import Router, { useRouter } from "next/navigation";
import AgentList from "./components/agentList";
import MaskList from "../chats/masklist/MaskList";
import { useMasks } from "@/app/hooks/useMasks";
import { Modal } from "antd";
import { MaskPage } from "../chats/masklist/mask";
import { useAgentActions } from "@/app/hooks/useAgentActions";
const { Header, Content, Footer, Sider } = Layout;

export type RenderPompt = Pick<Prompt, "title" | "content">;

const useHasHydrated = (): boolean => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

const SimpleWorkflow: React.FC = () => {
	const isAuthenticated = useAuthStore().isAuthenticated;
	const { selectedId, workflowGroups, addWorkflowGroup } = useWorkflowContext();
	const [orderedSessions, setOrderedSessions] = useState<ChatSession[]>([]);
	const [isAuth, setIsAuth] = useState(false);
	const [showAgentList, setShowAgentList] = useState(false);
	const router = useRouter();
	const { onDelete, onChat } = useAgentActions();

	useEffect(() => {
		setIsAuth(isAuthenticated);
	}, [isAuthenticated]);

	const handleModalClick = () => {
		setShowAgentList(!showAgentList);
	};

	if (!useHasHydrated()) {
		return (
			<>
				<LoadingIcon />
				<p>Loading..</p>
			</>
		);
	}

	const MainScreen = () => {
		if (!isAuth) {
			return (
				<div className={styles["welcome-container"]}>
					<div className={styles["logo"]}>
						<Image
							className={styles["logo-image"]}
							src="/logo-2.png"
							alt="Logo"
							width={200}
							height={253}
						/>
					</div>
					<div className={styles["title"]}>您还未登录, 请登录后开启该功能</div>
					<div className={styles["actions"]}>
						<Button
							type="default"
							className={styles["action-button"]}
							icon={<PlusCircleOutlined />}
							onClick={() => {
								router.push("/auth/");
							}}
						>
							登录
						</Button>
					</div>
				</div>
			);
		}

		if (orderedSessions.length !== 0) {
			return orderedSessions.map((session, index) => (
				<_Chat key={index} _session={session} index={index} isworkflow={true} />
			));
		}

		if (workflowGroups.length !== 0 && orderedSessions.length === 0) {
			return (
				<div className={styles["welcome-container"]}>
					<div className={styles["logo"]}>
						<Image
							className={styles["logo-image"]}
							src="/logo-2.png"
							alt="Logo"
							width={200}
							height={253}
						/>
					</div>
					<div className={styles["title"]}>
						<a onClick={(e) => e.preventDefault()}>
							<Button
								type="dashed"
								className={styles["plus"]}
								icon={<PlusCircleOutlined />}
								onClick={() => handleModalClick()}
							>
								新增助手
							</Button>
						</a>
						来开启工作流
					</div>
					<div className={styles["sub-title"]}>
						在本页删除助手, 不会影响正常页的会话. 超级对话功能只在电脑端生效,
						手机端无法使用.
						<p>该功能属于会员功能, 目前限时开放.</p>
					</div>
				</div>
			);
		}

		return (
			<div className={styles["welcome-container"]}>
				<div className={styles["logo"]}>
					<Image
						className={styles["logo-image"]}
						src="/logo-2.png"
						alt="Logo"
						width={200}
						height={253}
					/>
				</div>
				<div className={styles["title"]}>
					您还没有建立对话, 点击{" "}
					<Button
						type="dashed"
						className={styles["plus"]}
						icon={<PlusCircleOutlined />}
						onClick={() => addWorkflowGroup()}
					>
						新建对话
					</Button>
					按钮开始
				</div>
			</div>
		);
	};

	return (
		<Layout style={{ flexDirection: "row" }}>
			<WorkflowSidebar />
			<Layout
				className={`${styles2["window-content"]} ${styles["background"]}`}
			>
				{selectedId !== "" && <AgentList />}
				<div className={styles["chats-container"]}>
					<MainScreen />
				</div>
				{showAgentList && (
					<Modal
						open={showAgentList}
						onCancel={handleModalClick}
						footer={null}
						width="70vw"
						height="80vh"
						style={{ overflow: "scroll" }}
					>
						<MaskPage onChat={onChat} onDelete={onDelete} />
					</Modal>
				)}
			</Layout>
		</Layout>
	);
};

const App = () => {
	return (
		<WorkflowProvider>
			<HashRouter>
				<SimpleWorkflow />
			</HashRouter>
		</WorkflowProvider>
	);
};

export default App;
