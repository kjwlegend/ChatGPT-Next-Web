import BotIcon from "../icons/bot.png";

import { DeleteIcon } from "@/app/icons";

import styles from "@/app/chats/home.module.scss";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "@/app/store";

import Locale from "@/app/locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import { MaskAvatar } from "@/app/chats/masklist/mask";
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

import { useRef, useEffect, useState, useCallback } from "react";
import { showConfirm } from "@/app/components/ui-lib";
import { useUserStore } from "@/app/store";
import { useWorkflowStore } from "@/app/store/workflow";
import { useMobileScreen } from "@/app/utils";
import { ChatData, getChat } from "@/app/api/backend/chat";
import { UpdateChatMessages } from "@/app/services/chatService";
import { ChatItem } from "./chatItem";

import usedoubleAgent, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";

export function DoubleAgentChatList(props: { narrow?: boolean }) {
	const {
		conversations,
		currentConversationId,
		startNewConversation,
		setCurrentConversationId,
		deleteConversation,
	} = usedoubleAgent();

	const [sortedSessions, setSortedSessions] = useState<
		DoubleAgentChatSession[]
	>([]);

	// 将conversations 排序 并更新到 sortedSessions
	useEffect(() => {
		const sorted = conversations.sort((a, b) => {
			// lastUpdateTime 降序 , lastUpdateTime 是 string 格式的时间戳
			const aTime = new Date(a.lastUpdateTime).getTime();
			const bTime = new Date(b.lastUpdateTime).getTime();
			return bTime - aTime;
		});
		setSortedSessions(sorted);
	}, [conversations]);

	const isMobileScreen = useMobileScreen();

	// const getMessages = async (sessionid: string) => {
	// 	const param: ChatData = {
	// 		chat_session: sessionid,
	// 		user: userStore.user.id,
	// 		limit: 60,
	// 	};
	// 	try {
	// 		const chatSessionList = await getChat(param);
	// 		// console.log("chatSessionList", chatSessionList.data);
	// 		// 直接使用 chatStore 的方法更新 sessions
	// 		UpdateChatMessages(param.chat_session, chatSessionList.data);
	// 	} catch (error) {
	// 		console.log("get chatSession list error", error);
	// 	}
	// };

	const itemClickHandler = (item: any) => {
		setCurrentConversationId(item.id);
		// getMessages(item.id);
		console.log("item", item);
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
							{sortedSessions.map((item, i) => (
								<ChatItem
									title={item.topic}
									time={new Date(item.lastUpdateTime).toLocaleString()}
									count={item.messages?.length ?? 0}
									key={item.id}
									id={item.id}
									index={i}
									selected={item.id === currentConversationId}
									onClick={() => {
										itemClickHandler(item);
									}}
									onDelete={async () => {
										if (
											(!props.narrow && !isMobileScreen) ||
											(await showConfirm(Locale.Home.DeleteChat))
										) {
											deleteConversation(item.id);
										}
									}}
									narrow={props.narrow}
									mask={item.firstAIConfig}
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
