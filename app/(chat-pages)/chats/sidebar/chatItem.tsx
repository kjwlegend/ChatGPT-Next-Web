import BotIcon from "@/app/icons/bot.png";

import { DeleteIcon } from "@/app/icons";

import styles from "../home.module.scss";
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
import { MaskAvatar } from "../masklist/mask";
import { Mask } from "@/app/types/";
import { useRef, useEffect, useState, useCallback } from "react";

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
	return (
		<div
			className={`${styles["chat-item"]} ${
				props.selected && styles["chat-item-selected"]
			}`}
			onClick={props.onClick}
			title={`${props.title}\n${Locale.ChatItem.ChatItemCount(props.count)}`}
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
						{/* <span className={styles["chat-item-info"]}>
       {Locale.ChatItem.ChatItemCount(props.count)}
      </span> */}
					</div>
					<div className={styles["chat-item-date"]}>{props.time}</div>
				</>
			)}

			<div
				className={styles["chat-item-delete"]}
				onClickCapture={(e) => {
					e.stopPropagation(); // 先停止事件传播
					e.preventDefault(); // 然后防止默认行为
					props.onDelete &&
						typeof props.onDelete === "function" &&
						props.onDelete(); // 确保 onDelete 是一个函数再调用
				}}
			>
				<DeleteIcon />
			</div>
		</div>
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
