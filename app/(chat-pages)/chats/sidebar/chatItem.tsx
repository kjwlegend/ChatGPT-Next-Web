import { useRef, useEffect, useState, useCallback } from "react";

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
import { Avatar } from "@/app/components/avatar";
import { Mask } from "@/app/types/";

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
						<Avatar model={props.mask} />
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
