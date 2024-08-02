import BotIcon from "@/app/icons/bot.png";
import { useMemo } from "react";

import { DeleteIcon } from "@/app/icons";

import styles from "../home.module.scss";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../../store";

import Locale from "../../locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "../../constant";
import { MaskAvatar } from "../masklist/mask";
import { Mask } from "@/app/types/mask";
import { useRef, useEffect, useState, useCallback } from "react";
import { showConfirm } from "@/app/components/ui-lib";
import { useUserStore } from "../../store";
import { useWorkflowStore } from "../../store/workflow";
import { useMobileScreen } from "../../utils";
import { UpdateChatMessages } from "../../services/chatService";
import { ChatItem, ChatItemShort } from "./chatItem";
import { PaginationData, getChatSessionChats } from "@/app/services/chats";

// export function ChatList(props: { narrow?: boolean }) {
// 	const [
// 		currentSessionId,
// 		selectSession,
// 		selectSessionById,
// 		moveSession,
// 		sortSession,
// 	] = useChatStore((state) => [
// 		state.currentSessionId,
// 		state.selectSession,
// 		state.selectSessionById,
// 		state.moveSession,
// 		state.sortSession,
// 	]);
// 	const chatStore = useChatStore();
// 	const { sessions } = chatStore;

// 	const [chatlist, setChatlist] = useState(sessions);

// 	useEffect(() => {
// 		sortSession();
// 		// setChatlist(sessions);
// 	}, [sessions, sortSession]);

// 	const workflowStore = useWorkflowStore();
// 	const navigate = useNavigate();
// 	const userStore = useUserStore();
// 	const isMobileScreen = useMobileScreen();

// 	const onDragEnd: OnDragEndResponder = (result) => {
// 		const { destination, source } = result;
// 		if (!destination) {
// 			return;
// 		}

// 		if (
// 			destination.droppableId === source.droppableId &&
// 			destination.index === source.index
// 		) {
// 			return;
// 		}

// 		moveSession(source.index, destination.index);
// 	};

// 	return (
// 		<DragDropContext onDragEnd={onDragEnd}>
// 			<Droppable droppableId="chat-list">
// 				{(provided) => {
// 					return (
// 						<div
// 							className={styles["chat-list"]}
// 							ref={provided.innerRef}
// 							{...provided.droppableProps}
// 						>
// 							{sessions.length === 0 ? (
// 								<div className={styles["no-conversations"]}>暂无对话</div>
// 							) : (
// 								sessions.map((item, i) => (
// 									<ChatItem
// 										title={item.topic}
// 										time={
// 											new Date(item.lastUpdate).toLocaleDateString(undefined, {
// 												month: "2-digit",
// 												day: "2-digit",
// 											}) +
// 											" " +
// 											new Date(item.lastUpdate).toLocaleTimeString(undefined, {
// 												hour: "2-digit",
// 												minute: "2-digit",
// 											})
// 										}
// 										count={item.chat_count ?? item.messages.length}
// 										key={item.id}
// 										id={item.id}
// 										index={i}
// 										selected={item.id === currentSessionId}
// 										onClick={() => {

// 										}}
// 										onDelete={async () => {
// 											if (
// 												(!props.narrow && !isMobileScreen) ||
// 												(await showConfirm(Locale.Home.DeleteChat))
// 											) {
// 												chatStore.deleteSession(i, userStore);
// 											}
// 										}}
// 										narrow={props.narrow}
// 										mask={item.mask}
// 									/>
// 								))
// 							)}
// 							{provided.placeholder}
// 						</div>
// 					);
// 				}}
// 			</Droppable>
// 		</DragDropContext>
// 	);
// }

interface ChatListProps {
	narrow?: boolean;
	chatSessions: any[];
	onChatItemClick: (id: string) => void;
	onChatItemDelete: (id: number) => void;
}

export function ChatList({
	narrow,
	chatSessions,
	onChatItemClick,
	onChatItemDelete,
}: ChatListProps) {
	const [chatlist, setChatlist] = useState(chatSessions);
	const chatStore = useChatStore();
	const {
		currentSessionId,
		selectSession,
		selectSessionById,
		moveSession,
		sortSession,
	} = chatStore;

	// useEffect(() => {
	// 	setChatlist(chatSessions);
	// }, [chatSessions]);

	const [selectedChatId, setSelectedChatId] = useState<string | null>(null); // 管理选中的聊天项

	const handleChatItemClick = (id: string) => {
		setSelectedChatId(id); // 更新选中的聊天项
		onChatItemClick(id); // 调用外部的点击处理函数
	};

	return (
		<div className={styles["chat-list"]}>
			{chatlist.length === 0 ? (
				<div className={styles["no-conversations"]}>暂无对话</div>
			) : (
				chatlist.map((item, i) => (
					<ChatItem
						title={item.topic}
						time={
							new Date(item.lastUpdate).toLocaleDateString(undefined, {
								month: "2-digit",
								day: "2-digit",
							}) +
							" " +
							new Date(item.lastUpdate).toLocaleTimeString(undefined, {
								hour: "2-digit",
								minute: "2-digit",
							})
						}
						count={item.chat_count ?? item.messages.length}
						key={item.id}
						id={item.id}
						index={i}
						selected={item.id === currentSessionId}
						onClick={() => handleChatItemClick(item.id)} // 处理点击事件
						onDelete={() => onChatItemDelete(item.id)}
						narrow={narrow}
						mask={item.mask}
					/>
				))
			)}
		</div>
	);
}
