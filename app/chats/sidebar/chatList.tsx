import BotIcon from "../icons/bot.png";

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
import { Mask } from "../../store/mask";
import { useRef, useEffect, useState, useCallback } from "react";
import { showConfirm } from "@/app/components/ui-lib";
import { useUserStore } from "../../store";
import { useWorkflowStore } from "../../store/workflow";
import { useMobileScreen } from "../../utils";
import { ChatData, getChat } from "../../api/backend/chat";
import { UpdateChatMessages } from "../../services/chatService";
import { ChatItem, ChatItemShort } from "./chatItem";

export function ChatList(props: { narrow?: boolean }) {
	const [sessions, selectedIndex, selectSession, moveSession, sortSession] =
		useChatStore((state) => [
			state.sessions,
			state.currentSessionIndex,
			state.selectSession,
			state.moveSession,
			state.sortSession,
		]);

	useEffect(() => {
		sortSession();
	}, []);
	const chatStore = useChatStore();
	const workflowStore = useWorkflowStore();
	const navigate = useNavigate();
	const userStore = useUserStore();
	const isMobileScreen = useMobileScreen();

	const getMessages = async (sessionid: string) => {
		const param: ChatData = {
			chat_session: sessionid,
			user: userStore.user.id,
			limit: 60,
		};
		try {
			const chatSessionList = await getChat(param);
			// console.log("chatSessionList", chatSessionList.data);
			// 直接使用 chatStore 的方法更新 sessions
			UpdateChatMessages(param.chat_session, chatSessionList.data);
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
							{sessions.map((item, i) => (
								<ChatItem
									title={item.topic}
									time={new Date(item.lastUpdate).toLocaleString()}
									count={item.chat_count ?? item.messages.length}
									key={item.id}
									id={item.id}
									index={i}
									selected={i === selectedIndex}
									onClick={() => {
										navigate(Path.Chat);
										selectSession(i);
										getMessages(item.id);
									}}
									onDelete={async () => {
										if (
											(!props.narrow && !isMobileScreen) ||
											(await showConfirm(Locale.Home.DeleteChat))
										) {
											chatStore.deleteSession(i, userStore);
											workflowStore.deleteSession(item.id);
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
