"use client";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	Fragment,
} from "react";
import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { HashRouter } from "react-router-dom";
import { useChatStore, useUserStore } from "@/app/store";

import LoadingIcon from "@/app/icons/three-dots.svg";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
	useWorkflowSessionActions,
	useWorkflowSessions,
	WorkflowProvider,
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
	Modal,
} from "antd";
import { DeleteIcon } from "@/app/icons";
import Locale from "@/app/locales";

import { _Chat } from "@/app/(chat-pages)/chats/chat/main";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
	OnDragUpdateResponder,
} from "@hello-pangea/dnd";
import { workflowChatSession } from "@/app/types/";
import { useSimpleWorkflowService } from "../hooks/useSimpleWorkflowHook";
import { MaskPage } from "../../chats/masklist/mask";
import { useAgentActions } from "@/app/hooks/useAgentActions";

export function ChatItemShort(props: {
	onClick?: () => void;
	onDelete?: () => void;
	title: string;
	count: number;
	time: string;
	selected: boolean;
	id: string;
	index: number;
	narrow?: boolean;
	mask: Mask;
}) {
	const draggableRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (props.selected && draggableRef.current) {
			draggableRef.current?.scrollIntoView({
				block: "center",
			});
		}
	}, [props.selected]);
	return (
		<Draggable draggableId={`${props.id}`} index={props.index}>
			{(provided) => (
				<div
					className={`${styles2["chat-item"]} ${styles2["multi-chat"]} ${
						props.selected && styles2["chat-item-selected"]
					}`}
					onClick={props.onClick}
					ref={(ele) => {
						draggableRef.current = ele;
						provided.innerRef(ele);
					}}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					title={`${props.title}\n${Locale.ChatItem.ChatItemCount(
						props.count,
					)}`}
				>
					<>
						<div className={styles2["chat-item-title"]}>
							{props.title}
							<span className={styles2["chat-item-subtitle"]}>
								id:{props.id}
							</span>
						</div>
					</>

					<div
						className={styles2["chat-item-delete"]}
						onClickCapture={(e) => {
							props.onDelete?.();
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<DeleteIcon />
					</div>
				</div>
			)}
		</Draggable>
	);
}

export default function AgentList(props: {
	workflowGroup: any;
	sessions: any[];
}) {
	const [selectIndex, setSelectIndex] = useState(0);
	const { deleteSessionFromGroup, moveSession } = useWorkflowSessionActions();

	const [orderedSessions, setOrderedSessions] = useState<any[]>(props.sessions);

	const [currentGroup, setCurrentGroup] = useState<any>(props.workflowGroup);
	const { id: groupId, topic, description } = currentGroup;

	useEffect(() => {
		setOrderedSessions(props.sessions);
		setCurrentGroup(props.workflowGroup);
	}, [props.sessions, props.workflowGroup]);

	console.log("debug agentList", orderedSessions);
	const [showAgentList, setShowAgentList] = useState(false);
	const handleModalClick = useCallback(() => {
		setShowAgentList(!showAgentList);
	}, [showAgentList]);

	const { handleAgentClick } = useSimpleWorkflowService();
	const { onDelete, onChat } = useAgentActions();

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
		moveSession(groupId, source.index, destination.index);
		setSelectIndex(destination.index);
	};

	const itemClickHandler = (item: any, i: number) => {
		// console.log("item", item);
		setSelectIndex(i);
	};

	const itemDeleteHandler = async (item: any) => {
		// console.log("item", item);
		deleteSessionFromGroup(groupId, item.id);
	};

	return (
		<Fragment>
			<div className={styles["session-container"]}>
				{/* <div className={styles["session-description"]}>
					<div className={styles["session-title"]}>{currentGroup?.topic}</div>
					<div className={styles["session-subtitle"]}>
						id: {groupId}
						{currentGroup?.description}
					</div>


				</div> */}
				<Button
					type="dashed"
					className={styles["plus"]}
					icon={<PlusCircleOutlined />}
					onClick={() => setShowAgentList(!showAgentList)}
					size="small"
				>
					新增助手
				</Button>
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
											title={item.mask.name ?? ""}
											time={new Date(item.lastUpdateTime).toLocaleString()}
											count={0}
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
					<MaskPage onItemClick={handleAgentClick} onDelete={onDelete} />
				</Modal>
			)}
		</Fragment>
	);
}
