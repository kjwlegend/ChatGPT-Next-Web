"use client";

import BotIcon from "@/app/icons/bot.png";

import { DeleteIcon } from "@/app/icons";

import styles from "@/app/chats/home.module.scss";
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
import { MaskAvatar } from "@/app/chats/masklist/mask";

import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { showConfirm } from "@/app/components/ui-lib";
import { useUserStore } from "../../store";
import { useWorkflowStore } from "../../store/workflow";
import { useMobileScreen } from "../../utils";
import { ChatData, getChat } from "../../api/backend/chat";
import { UpdateChatMessages } from "../../services/chatService";
import { ChatItem } from "../double-agents/components/chatItem";
import { Modal } from "@/app/components/ui-lib";
import usedoubleAgent, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import { workflowGroup } from "../../store/workflow";
import { useWorkflowContext } from "./workflowContext";
import { WorkflowModalConfig } from "./modal";

export function WorkflowChatList(props: { narrow?: boolean }) {
	const { workflowGroup, selectedId, setselectedId, deleteWorkflowGroup } =
		useWorkflowContext();

	// 将conversations 排序 并更新到 sortedSessions
	// 排序 workflowGroup 中的会话

	const sortedWorkflowGroup = Object.values(workflowGroup).sort((a, b) => {
		const aTime = new Date(a.lastUpdateTime).getTime(); // 假设第一个会话的 lastUpdateTime 代表组的时间
		const bTime = new Date(b.lastUpdateTime).getTime(); // 同上
		return bTime - aTime;
	});
	const isMobileScreen = useMobileScreen();

	const itemClickHandler = (item: any) => {
		setselectedId(item.id);
		// getMessages(item.id);
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

	// add the workflow modal, and trigger the modal when the add button is clicked
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [modalContent, setModalContent] = useState<any>(null);
	const showModal = (item: any) => {
		setIsModalVisible(true);
		setModalContent(item);
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
									title={item.topic}
									time={new Date(item.lastUpdateTime).toLocaleString()}
									count={item.sessions?.length ?? 0}
									key={item.id}
									id={item.id}
									index={i}
									selected={item.id === selectedId}
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
									onEdit={() => {
										// 打开编辑对话框
										showModal(item);
									}}
									narrow={props.narrow}
								/>
							))}
							{isModalVisible && (
								<WorkflowModalConfig
									onClose={() => setIsModalVisible(false)}
									workflow={modalContent}
								/>
							)}
							{provided.placeholder}
						</div>
					);
				}}
			</Droppable>
		</DragDropContext>
	);
}
