import BotIcon from "../icons/bot.png";

import { DeleteIcon } from "@/app/icons";

import styles from "@/app/chats/home.module.scss";
import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../store";

import Locale from "../locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { MaskAvatar } from "@/app/chats/masklist/mask";
import { Mask } from "../store/mask";
import { useRef, useEffect, useState, useCallback } from "react";
import { showConfirm } from "@/app/components/ui-lib";
import { useUserStore } from "../store";
import { useWorkflowStore } from "../store/workflow";
import { useMobileScreen } from "../utils";
import { ChatData, getChat } from "../api/backend/chat";
import { UpdateChatMessages } from "../services/chatService";
import { ChatItem } from "../double-agents/components/chatItem";

import usedoubleAgent, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import { useWorkflowContext } from "./workflowContext";

export function WorkflowChatList(props: { narrow?: boolean }) {
	const {
		conversations,
		currentConversationId,
		startNewConversation,
		setCurrentConversationId,
		deleteConversation,
	} = usedoubleAgent();

	const { workflowGroup, selectedIndex, deleteWorkflowGroup } =
		useWorkflowContext();

	const [sortedSessions, setSortedSessions] = useState<
		DoubleAgentChatSession[]
	>([]);

	// 将conversations 排序 并更新到 sortedSessions
	// 排序 workflowGroup 中的会话
	const sortedWorkflowGroup = Object.values(workflowGroup).sort((a, b) => {
		const aTime = new Date(a.lastUpdateTime).getTime(); // 假设第一个会话的 lastUpdateTime 代表组的时间
		const bTime = new Date(b.lastUpdateTime).getTime(); // 同上
		return bTime - aTime;
	});
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
							{sortedWorkflowGroup.map((item, i) => (
								<ChatItem
									title={item.name}
									time={new Date(item.lastUpdateTime).toLocaleString()}
									count={item.sessions?.length ?? 0}
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
											deleteWorkflowGroup(item.id);
										}
									}}
									narrow={props.narrow}
									mask={item.sessions[0]?.mask ?? {}}
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
