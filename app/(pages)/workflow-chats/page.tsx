"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
	use,
} from "react";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

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
import styles2 from "@/app/chats/home.module.scss";
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
import { ChatItemShort } from "../../chats/sidebar/chatItem";

import { _Chat } from "../../chats/chat/main";
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
const { Header, Content, Footer, Sider } = Layout;

export type RenderPompt = Pick<Prompt, "title" | "content">;

const useHasHydrated = (): boolean => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

const GenerateMenuItems = () => {
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const maskStore = useMaskStore().getAll();

	const { selectedId, addSessionToGroup } = useWorkflowStore();

	const _isworkflow = true;

	const handleMaskClick = async (mask: any) => {
		const newsession: ChatSession = await chatStore.newSession(
			mask,
			userStore,
			_isworkflow,
		);

		addSessionToGroup(selectedId, newsession.id);
	};

	const maskItems = Object.values(maskStore).reduce(
		(result, mask) => {
			const category = mask.category;
			const categoryItem = result.find((item) => item.label === category);

			if (categoryItem) {
				categoryItem.children.push({
					key: mask.id,
					label: mask.name,
					onClick: () => {
						handleMaskClick(mask);
					},
				});
			} else {
				result.push({
					key: category,
					label: category,
					children: [
						{
							key: mask.id,
							label: mask.name,
							onClick: () => {
								handleMaskClick(mask);
							},
						},
					],
				});
			}

			return result;
		},
		[] as {
			key: string;
			label: string;
			children: { key: string; label: string; onClick?: () => void }[];
		}[],
	);

	return [
		{
			key: "1",
			label: "选择助手",
			children: maskItems,
		},
	];
};

function AgentList() {
	const [selectIndex, setSelectIndex] = useState(0);
	const { selectedId, workflowGroup, deleteSessionFromGroup, moveSession } =
		useWorkflowContext();
	const chatstore = useChatStore();
	const sessionIds = workflowGroup[selectedId]?.sessions;
	const [orderedSessions, setOrderedSessions] = useState<ChatSession[]>([]);

	// 获取workflowGroup中的sessions ids, 并在chatstore 的sessions 中获取session信息

	useEffect(() => {
		// 保证 orderedSessions 的顺序与 sessionIds 的顺序一致
		const updatedSessions =
			sessionIds
				?.map((sessionId) =>
					chatstore.sessions.find((session) => session.id === sessionId),
				)
				.filter((session): session is ChatSession => session !== undefined) ??
			[]; // 使用类型保护来过滤 undefined 值

		setOrderedSessions(updatedSessions);
		// console.log("sessionsid", sessionIds, "orderedSessions", updatedSessions);
	}, [sessionIds, chatstore.sessions]); // 添加 chatstore.sessions 作为依赖项

	const items: MenuProps["items"] = GenerateMenuItems();

	const onDragEnd: OnDragEndResponder = (result) => {
		const { destination, source } = result;
		// console.log("destination", destination, "source", source);
		if (!destination) {
			return;
		}

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}
		moveSession(selectedId, source.index, destination.index);
		setSelectIndex(destination.index);
	};

	const itemClickHandler = (item: any, i: number) => {
		// console.log("item", item);
		setSelectIndex(i);
	};

	const itemDeleteHandler = async (item: any) => {
		// console.log("item", item);
		deleteSessionFromGroup(selectedId, item.id);
	};

	return (
		<WorkflowProvider>
			<div className={styles["session-container"]}>
				{orderedSessions && (
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable droppableId="chat-list" direction="horizontal">
							{(provided) => (
								<div
									className={styles["session-list"]}
									ref={provided.innerRef}
									{...provided.droppableProps}
								>
									{orderedSessions.map((item, i) => (
										<ChatItemShort
											title={item.topic}
											time={new Date(item.lastUpdate).toLocaleString()}
											count={item.messages.length}
											key={item.id}
											id={item.id}
											index={i}
											selected={i === selectIndex}
											onClick={() => {
												itemClickHandler(item, i);
											}}
											onDelete={async () => {
												itemDeleteHandler(item);
											}}
											mask={item.mask}
										/>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				)}

				{/* button 样式 新增session */}

				{/* 下拉菜单 */}

				<Dropdown menu={{ items }}>
					<a onClick={(e) => e.preventDefault()}>
						<Button
							type="dashed"
							className={styles["plus"]}
							icon={<PlusCircleOutlined />}
						>
							新增助手
						</Button>
					</a>
				</Dropdown>
			</div>
		</WorkflowProvider>
	);
}

export default function Chat() {
	const chatStore = useChatStore();
	const isAuthenticated = useAuthStore().isAuthenticated;

	const { selectedId, workflowGroup, addWorkflowGroup } = useWorkflowStore();
	const sessionIds = workflowGroup[selectedId]?.sessions;

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

	useEffect(() => {
		// 保证 orderedSessions 的顺序与 sessionIds 的顺序一致
		const updatedSessions =
			sessionIds
				?.map((sessionId) =>
					chatStore.sessions.find((session) => session.id === sessionId),
				)
				.filter((session): session is ChatSession => session !== undefined) ??
			[]; // 使用类型保护来过滤 undefined 值

		setOrderedSessions(updatedSessions);

		// console.log("sessionsid", sessionIds, "orderedSessions", updatedSessions);
	}, [sessionIds, chatStore.sessions]); // 添加 chatstore.sessions 作为依赖项
	const userid = useUserStore.getState().user.id;

	const items: MenuProps["items"] = GenerateMenuItems();

	const addWorkflowGroupHandler = useCallback(async () => {
		messageApi.open({
			content: "工作流组创建中",
			type: "loading",
		});
		try {
			const res = await createWorkflowSession({
				user: userid,
				topic: WORKFLOW_DEFAULT_TITLE,
			});

			if (res.code === 401) {
				throw new Error("登录状态已过期, 请重新登录");
			}

			await addWorkflowGroup(res.data.id, WORKFLOW_DEFAULT_TITLE);
			messageApi.destroy();
			messageApi.success("工作流组创建成功");
		} catch (error: any) {
			messageApi.error(`工作流组创建失败: ${error}`);
		}
	}, [addWorkflowGroup]);

	if (!useHasHydrated()) {
		return (
			<>
				<LoadingIcon />
				<p>Loading..</p>
			</>
		);
	}

	// use a better clear structure to render content

	function renderContent() {
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

		if (Object.keys(workflowGroup).length != 0 && orderedSessions.length == 0) {
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
						<Dropdown
							menu={{ items }}
							autoAdjustOverflow={true}
							autoFocus={true}
						>
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
						onClick={() => addWorkflowGroupHandler()}
					>
						新建对话
					</Button>
					按钮开始
				</div>
			</div>
		);
	}

	return (
		<WorkflowProvider>
			<Layout style={{ flexDirection: "row" }}>
				<WorkflowSidebar />
				<Layout
					className={`${styles2["window-content"]} ${styles["background"]}`}
				>
					{selectedId != "" && <AgentList />}
					<div className={styles["chats-container"]}>{renderContent()}</div>
				</Layout>
			</Layout>
		</WorkflowProvider>
	);
}
