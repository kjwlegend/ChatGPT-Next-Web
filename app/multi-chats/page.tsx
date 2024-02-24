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

import { useChatStore, useUserStore, ChatSession } from "../store";
import { api } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { Prompt, usePromptStore } from "../store/prompt";
import { useMaskStore } from "../store/mask";

import BrainIcon from "../icons/brain.svg";
import LoadingIcon from "../icons/three-dots.svg";
import { PlusCircleOutlined } from "@ant-design/icons";

import styles from "@/app/multi-chats/multi-chats.module.scss";
import { Avatar as UserAvatar, Button, Menu, Dropdown, Switch } from "antd";
import type { MenuProps } from "antd";

import { ChatItemShort } from "../chats/sidebar/chatItem";

import { _Chat } from "../chats/chat/main";

import Image from "next/image";

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

	const _isworkflow = true;

	function setworkflow(_session: ChatSession) {
		chatStore.setworkflow(_session, _isworkflow);
	}

	const allSessions = chatStore.sessions;

	const sessionItems = allSessions.map((item) => ({
		key: item.id,
		label: item.topic,
		onClick: () => {
			setworkflow(item);
		},
	}));

	const handleMaskClick = (mask: any) => {
		const newsession: ChatSession = chatStore.newSession(
			mask,
			userStore,
			_isworkflow,
		);
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
			label: "选择已有对话",
			children: sessionItems,
		},
		{
			key: "2",
			label: "新建其他助手",
			children: maskItems,
		},
	];
};

import {
	DragDropContext,
	Droppable,
	Draggable,
	OnDragEndResponder,
	OnDragUpdateResponder,
} from "@hello-pangea/dnd";
import { useWorkflowStore } from "../store/workflow";
import { useAuthStore } from "../store/auth";

function SessionList() {
	const [selectIndex, setSelectIndex] = useState(0);
	const { moveSession, setworkflow } = useChatStore();
	const chatStore = useChatStore();
	const sessions = chatStore.sessions.filter((session) => session.isworkflow);
	// console.log("sessions", sessions);

	const items: MenuProps["items"] = GenerateMenuItems();

	const onDragEnd: OnDragEndResponder = (result) => {
		const { destination, source } = result;
		console.log("destination", destination, "source", source);
		if (!destination) {
			return;
		}

		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}
		moveSession(source.index, destination.index, sessions);
		setSelectIndex(destination.index);
	};

	return (
		<>
			<div className={styles["session-container"]}>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="chat-list" direction="horizontal">
						{(provided) => (
							<div
								className={styles["session-list"]}
								ref={provided.innerRef}
								{...provided.droppableProps}
							>
								{sessions.map((item, i) => (
									<ChatItemShort
										title={item.topic}
										time={new Date(item.lastUpdate).toLocaleString()}
										count={item.messages.length}
										key={item.id}
										id={item.id}
										index={i}
										selected={i === selectIndex}
										onClick={() => {
											setSelectIndex(i);
											console.log("setSelectIndex", i);
										}}
										onDelete={async () => {
											setworkflow(item, false);
										}}
										mask={item.mask}
									/>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>

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
		</>
	);
}

export default function Chat() {
	const chatStore = useChatStore();
	const sessions = chatStore.sessions.filter((session) => session.isworkflow);
	const isAuth = useAuthStore().isAuthenticated;

	const items: MenuProps["items"] = GenerateMenuItems();

	if (!useHasHydrated()) {
		return (
			<>
				<LoadingIcon />
				<p>Loading..</p>
			</>
		);
	}

	return (
		<>
			<SessionList />
			<div className={styles["chats-container"]}>
				{!isAuth ? (
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
							您还未登录, 请登录后开启该功能
						</div>

						<div className={styles["actions"]}>
							<Button
								type="default"
								className={styles["action-button"]}
								icon={<PlusCircleOutlined />}
								onClick={() => {
									window.location.href = "/auth/";
								}}
							>
								登录
							</Button>
						</div>
					</div>
				) : sessions.length !== 0 ? (
					sessions.map((session, index) => (
						<_Chat
							key={index}
							_session={session}
							index={index}
							isworkflow={true}
						/>
					))
				) : (
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
				)}
			</div>
		</>
	);
}
