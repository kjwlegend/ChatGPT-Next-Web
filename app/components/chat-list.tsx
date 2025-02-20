import DeleteIcon from "../icons/delete.svg";
import BotIcon from "../icons/bot.png";

import styles from "./home.module.scss";
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
import { MaskAvatar } from "./mask";
import { Mask } from "../store/mask";
import { useRef, useEffect } from "react";
import { showConfirm } from "./ui-lib";
import { useUserStore } from "../store";
import { useWorkflowStore } from "../store/workflow";
import { useMobileScreen } from "../utils";

export function ChatItem(props: {
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
					className={`${styles["chat-item"]} ${
						props.selected && styles["chat-item-selected"]
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
					{props.narrow ? (
						<div className={styles["chat-item-narrow"]}>
							<div className={styles["chat-item-avatar"] + " no-dark"}>
								<MaskAvatar mask={props.mask} />
							</div>
						</div>
					) : (
						<>
							<div className={styles["chat-item-title"]}>
								{props.title}
								<span className={styles["chat-item-info"]}>
									{Locale.ChatItem.ChatItemCount(props.count)}
								</span>
							</div>
							{/* <div className={styles["chat-item-info"]}>
                <div className={styles["chat-item-count"]}>
                  {Locale.ChatItem.ChatItemCount(props.count)}
                </div>
                <div className={styles["chat-item-date"]}>{props.time}</div>
              </div> */}
						</>
					)}

					<div
						className={styles["chat-item-delete"]}
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
					className={`${styles["chat-item"]} ${styles["multi-chat"]} ${
						props.selected && styles["chat-item-selected"]
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
						<div className={styles["chat-item-title"]}>{props.title}</div>
					</>

					<div
						className={styles["chat-item-delete"]}
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

export function ChatList(props: { narrow?: boolean }) {
	const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
		(state) => [
			state.sessions,
			state.currentSessionIndex,
			state.selectSession,
			state.moveSession,
		],
	);
	const chatStore = useChatStore();
	const workflowStore = useWorkflowStore();
	const navigate = useNavigate();
	const userStore = useUserStore();
	const isMobileScreen = useMobileScreen();

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
				{(provided) => (
					<div
						className={styles["chat-list"]}
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{sessions.map((item, i) => (
							<ChatItem
								title={item.topic}
								time={new Date(item.lastUpdate).toLocaleString()}
								count={item.messages.length}
								key={item.id}
								id={item.id}
								index={i}
								selected={i === selectedIndex}
								onClick={() => {
									navigate(Path.Chat);
									selectSession(i);
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
				)}
			</Droppable>
		</DragDropContext>
	);
}
