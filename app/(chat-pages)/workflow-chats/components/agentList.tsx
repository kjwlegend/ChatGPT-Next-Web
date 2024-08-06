"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
} from "react";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { HashRouter } from "react-router-dom";
import { useChatStore, useUserStore } from "@/app/store";

import LoadingIcon from "@/app/icons/three-dots.svg";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
	WorkflowContext,
	WorkflowProvider,
	useWorkflowContext,
} from "../workflowContext";

import { useMaskStore } from "@/app/store/mask";

import styles from "../workflow-chats.module.scss";
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

const GenerateMenuItems = () => {
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const maskStore = useMaskStore().getAll();

	const { selectedId, addSessionToGroup } = useWorkflowContext();

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

export default function AgentList() {
	const [selectIndex, setSelectIndex] = useState(0);
	const { selectedId, workflowGroups, deleteSessionFromGroup, moveSession } =
		useWorkflowContext();
	const chatstore = useChatStore();
	const sessionIds = workflowGroups.map((group) => group.id);
	const [orderedSessions, setOrderedSessions] = useState<ChatSession[]>([]);

	// 获取workflowGroup中的sessions ids, 并在chatstore 的sessions 中获取session信息

	// useEffect(() => {
	// 	// 保证 orderedSessions 的顺序与 sessionIds 的顺序一致
	// 	const updatedSessions =
	// 		sessionIds
	// 			?.map((sessionId) =>
	// 				chatstore.sessions.find((session) => session.id === sessionId),
	// 			)
	// 			.filter((session): session is ChatSession => session !== undefined) ??
	// 		[]; // 使用类型保护来过滤 undefined 值

	// 	setOrderedSessions(updatedSessions);
	// 	// console.log("sessionsid", sessionIds, "orderedSessions", updatedSessions);
	// }, [sessionIds, chatstore.sessions]); // 添加 chatstore.sessions 作为依赖项

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
											time={new Date(item.lastUpdateTime).toLocaleString()}
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
