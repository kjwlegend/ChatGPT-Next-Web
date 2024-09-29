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
	Suspense,
} from "react";
import { ChatMessage, ChatSession, Mask, sessionConfig } from "@/app/types/";

import { HashRouter } from "react-router-dom";
import { useChatStore, useUserStore } from "../../store";
import { ChatControllerPool } from "../../client/controller";
import { Prompt, usePromptStore } from "../../store/prompt";
import { useMaskStore } from "../../store/mask";
import Locale, { Lang } from "../../locales";

import LoadingIcon from "@/app/icons/three-dots.svg";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
	WorkflowProvider,
	useWorkflowGroupActions,
	useWorkflowGroups,
	useWorkflowSessionActions,
	useWorkflowSessions,
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

import { workflowChatSession } from "@/app/types/";
import { useAuthStore } from "../../store/auth";
import { WorkflowSidebar } from "./sidebar";
import { message } from "antd";
import Image from "next/image";

import Router, { useRouter } from "next/navigation";
import AgentList from "./components/agentList";
import MaskList from "../chats/masklist/MaskList";
import { useMasks } from "@/app/hooks/useMasks";

import { MaskPage } from "../chats/masklist/mask";
import { useAgentActions } from "@/app/hooks/useAgentActions";
import { useSimpleWorkflowService } from "@/app/(chat-pages)/workflow-chats/hooks/useSimpleWorkflowHook";
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
	const { workflowGroups, selectedId } = useWorkflowGroups();
	const workflowSessions = useWorkflowSessions() as workflowChatSession[];
	const { addWorkflowGroup } = useWorkflowGroupActions();

	const [isAuth, setIsAuth] = useState(false);
	const router = useRouter();

	const workflowSessionsRef = useRef(workflowSessions);

	useEffect(() => {
		workflowSessionsRef.current = workflowSessions;
	}, [workflowSessions]);

	useEffect(() => {
		setIsAuth(isAuthenticated);
	}, [isAuthenticated]);

	const currentWorkflowGroup = useMemo(() => {
		return workflowGroups.find((group) => group.id === selectedId);
	}, [selectedId, workflowGroups]);

	const [currentSessions, setCurrentSessions] = useState<any[]>([]);

	useEffect(() => {
		const sessions = workflowSessionsRef.current.filter(
			(session) => session.workflow_group_id === selectedId,
		);
		setCurrentSessions(sessions.sort((a, b) => a.order - b.order));
	}, [selectedId, workflowSessions]);

	if (!useHasHydrated()) {
		return (
			<>
				<LoadingIcon />
				<p>Loading..</p>
			</>
		);
	}

	return (
		<Layout className="tight-container">
			<WorkflowSidebar />
			<Layout
				className={`${styles2["window-content"]} ${styles["background"]}`}
			>
				{selectedId !== "" && (
					<AgentList
						sessions={currentSessions}
						workflowGroup={currentWorkflowGroup}
					/>
				)}
				<div className={styles["chats-container"]}>
					<MainScreen
						isAuth={isAuth}
						currentSessions={currentSessions}
						workflowGroups={workflowGroups}
						addWorkflowGroup={addWorkflowGroup}
						router={router}
					/>
				</div>
			</Layout>
		</Layout>
	);
};

const MainScreen: React.FC<{
	isAuth: boolean;
	currentSessions: any[];
	workflowGroups: any[];
	addWorkflowGroup: () => void;
	router: any;
}> = React.memo(
	({ isAuth, currentSessions, workflowGroups, addWorkflowGroup, router }) => {
		if (!isAuth) {
			return (
				<WelcomeContainer>
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
				</WelcomeContainer>
			);
		}
		if (currentSessions.length !== 0) {
			return currentSessions.map((session, index) => (
				<_Chat
					key={`workflow-${session?.id}`}
					_session={session}
					index={index}
					isworkflow={true}
					submitType="workflow"
					storeType="workflow"
				/>
			));
		}

		if (workflowGroups.length !== 0 && currentSessions.length === 0) {
			return (
				<WelcomeContainer>
					<div className={styles["title"]}>
						点击左上角
						<Button
							type="dashed"
							className={styles["plus"]}
							icon={<PlusCircleOutlined />}
							onClick={() => console.log("add")}
						>
							新增助手
						</Button>
						来开启工作流
					</div>
					<div className={styles["sub-title"]}>
						<p>该功能属于会员功能, 目前限时开放.</p>
					</div>
				</WelcomeContainer>
			);
		}

		return (
			<WelcomeContainer>
				<div className={styles["title"]}>
					您还没有建立对话, 点击{" "}
					<Button
						type="dashed"
						className={styles["plus"]}
						icon={<PlusCircleOutlined />}
						onClick={addWorkflowGroup}
					>
						新建对话
					</Button>
					按钮开始
				</div>
			</WelcomeContainer>
		);
	},
);

MainScreen.displayName = "MainScreen";

const WelcomeContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
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
		{children}
	</div>
);

WelcomeContainer.displayName = "WelcomeContainer";

const App = () => {
	return (
		<WorkflowProvider>
			<HashRouter>
				<Suspense fallback={<div>loading..</div>}>
					<SimpleWorkflow />
				</Suspense>
			</HashRouter>
		</WorkflowProvider>
	);
};

export default App;
