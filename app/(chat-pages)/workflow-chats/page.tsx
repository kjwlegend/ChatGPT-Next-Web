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
import Locale from "../../locales";

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

import type { MenuProps } from "antd";
import { ChatItemShort } from "@/app/(chat-pages)/chats/sidebar/chatItem";

import { _Chat } from "@/app/(chat-pages)/chats/chat/main";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
	OnDragUpdateResponder,
} from "@hello-pangea/dnd";
import { useWorkflowStore } from "../../store/workflow";
import { useAuthStore } from "../../store/auth";
import { WorkflowSidebar } from "./sidebar";
import { message } from "antd";
import Image from "next/image";
import { IconButton } from "../../components/button";
import { WORKFLOW_DEFAULT_TITLE } from "./workflowContext";
import { SEOHeader } from "@/app/components/seo-header";
import Router, { useRouter } from "next/navigation";
import AgentList from "./components/agentList";
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
	const chatStore = useChatStore();
	const isAuthenticated = useAuthStore().isAuthenticated;

	const { selectedId, workflowGroups, addWorkflowGroup } = useWorkflowContext();

	const sessionIds = workflowGroups.map((group) => group.id);

	const [orderedSessions, setOrderedSessions] = useState<ChatSession[]>([]);
	const [messageApi, contextHolder] = message.useMessage();

	console.log("orderedSessions", orderedSessions);

	const [isAuth, setIsAuth] = useState(false);

	const router = useRouter();

	// 获取workflowGroup中的sessions ids, 并在chatstore 的sessions 中获取session信息
	// checkout workflowGoup is not an empty object

	useEffect(() => {
		setIsAuth(isAuthenticated);
	}, []);

	// useEffect(() => {
	// 	// 保证 orderedSessions 的顺序与 sessionIds 的顺序一致
	// 	const updatedSessions =
	// 		sessionIds
	// 			?.map((sessionId) =>
	// 				chatStore.sessions.find((session) => session.id === sessionId),
	// 			)
	// 			.filter((session): session is ChatSession => session !== undefined) ??
	// 		[]; // 使用类型保护来过滤 undefined 值

	// 	setOrderedSessions(updatedSessions);

	// 	// console.log("sessionsid", sessionIds, "orderedSessions", updatedSessions);
	// }, [sessionIds, chatStore.sessions]); // 添加 chatstore.sessions 作为依赖项
	const userid = useUserStore.getState().user.id;

	if (!useHasHydrated()) {
		return (
			<>
				<LoadingIcon />
				<p>Loading..</p>
			</>
		);
	}

	// use a better clear structure to render content

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

		if (workflowGroups.length != 0 && orderedSessions.length == 0) {
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
						点击
						<Dropdown menu={{}} autoAdjustOverflow={true} autoFocus={true}>
							<a onClick={(e) => e.preventDefault()}>
								<Button
									type="dashed"
									className={styles["plus"]}
									icon={<PlusCircleOutlined />}
								>
									新增助手
								</Button>
							</a>
						</Dropdown>{" "}
						来开启工作流
					</div>
					<div className={styles["sub-title"]}>
						在本页删除助手, 不会影响正常页的会话. 超级对话功能只在电脑端生效,
						手机端无法使用.
						<p>该功能属于会员功能, 目前限时开放.</p>
					</div>
					<div className={styles["actions"]}></div>
				</div>
			);
		}
		//  default case
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
				{selectedId != "" && <AgentList />}
				<div className={styles["chats-container"]}>
					<MainScreen />
				</div>
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
