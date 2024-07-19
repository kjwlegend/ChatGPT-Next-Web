import BotIcon from "@/app/icons/bot.png";

import { DeleteIcon, EditIcon } from "@/app/icons";

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
import { DEFAULT_MASK_AVATAR, createEmptyMask } from "@/app/store/mask";
import { useRef, useEffect, useState, useCallback } from "react";
import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

export function ChatItem(props: {
	onClick?: () => void;
	onDelete?: () => void;
	onEdit?: () => void;
	title: string;
	count: number;
	time: string;
	selected: boolean;
	id: string;
	index: number;
	narrow?: boolean;
	mask?: Mask;
}) {
	const draggableRef = useRef<HTMLDivElement | null>(null);

	let mask: Mask;
	if (!props.mask) {
		mask = createEmptyMask();
	} else {
		mask = props.mask;
	}

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
								<MaskAvatar mask={mask} />
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
							<div className={styles["chat-item-date"]}>{props.time}</div>
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

					{/* Edit icon */}
					{props.onEdit && (
						<div
							className={styles["chat-item-edit"]}
							onClickCapture={(e) => {
								props.onEdit?.();
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<EditIcon />
						</div>
					)}
				</div>
			)}
		</Draggable>
	);
}
