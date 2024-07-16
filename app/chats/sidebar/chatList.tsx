import BotIcon from "../icons/bot.png";
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
import { ChatData, getChat } from "../../api/backend/chat";
import { UpdateChatMessages } from "../../services/chatService";
import { ChatItem, ChatItemShort } from "./chatItem";
import { PaginationData, getChatSessionChats } from "@/app/services/chats";
export function ChatList(props: { narrow?: boolean }) {
	const [
		currentSessionId,
		selectSession,
		selectSessionsById,
		moveSession,
		sortSession,
	] = useChatStore((state) => [
		state.currentSessionId,
		state.selectSession,
		state.selectSessionById,
		state.moveSession,
		state.sortSession,
	]);
	const chatStore = useChatStore();
	const { sessions } = chatStore;
	console.log(sessions);

	const [chatlist, setChatlist] = useState(sessions);

	useEffect(() => {
		sortSession();
		// setChatlist(sessions);
	}, [sessions, sortSession]);

	const filteredSessions = useMemo(() => {
		//  exlude workflow chat
		const newSessions = sessions.filter(
			(session) => session.isworkflow !== true,
		);
		console.log("newSessions", newSessions);
		return newSessions;
	}, [sessions]);

	// console.log("filteredSessions", filteredSessions);
	const workflowStore = useWorkflowStore();
	const navigate = useNavigate();
	const userStore = useUserStore();
	const isMobileScreen = useMobileScreen();

	const getMessages = async (sessionid: string) => {
		const param: PaginationData = {
			limit: 60,
		};
		try {
			const chatSessionList = await getChatSessionChats(param, sessionid);
			// 直接使用 chatStore 的方法更新 sessions
			const chats = chatSessionList.results;
			console.log("chatSessionList", chats);

			UpdateChatMessages(sessionid, chats);
		} catch (error) {
			console.log("get chatSession list error", error);
		}
	};
	const onDragEnd: OnDragEndResponder = (result) => {
		const { destination, source } = result;
		if (!destination) {
			return;
		}

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		moveSession(source.index, destination.index);
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="chat-list">
				{(provided) => {
					return (
						<div
							className={styles["chat-list"]}
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							{filteredSessions.map((item, i) => (
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
									onClick={() => {
										navigate(Path.Chat);
										selectSessionsById(item.id);
										console.log(i);
										getMessages(item.id);
									}}
									onDelete={async () => {
										if (
											(!props.narrow && !isMobileScreen) ||
											(await showConfirm(Locale.Home.DeleteChat))
										) {
											chatStore.deleteSession(i, userStore);
										}
									}}
									narrow={props.narrow}
									mask={item.mask}
								/>
							))}
							{provided.placeholder}
						</div>
					);
				}}
			</Droppable>
		</DragDropContext>
	);
}
