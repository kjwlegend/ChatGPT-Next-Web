import { useRef, useEffect, useState, useCallback } from "react";

import { DeleteIcon } from "@/app/icons";

import styles from "../home.module.scss";

import { EditIcon } from "@/app/icons";
import { useChatStore } from "@/app/store";

import Locale from "@/app/locales";

import { Avatar } from "@/app/components/avatar";
import { Mask } from "@/app/types/";

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
	mask: Mask;
}) {
	if (props.narrow) return;
	return (
		<div
			className={`${styles["chat-item"]} ${
				props.selected && styles["chat-item-selected"]
			}`}
			onClick={props.onClick}
			title={`${props.title}\n${Locale.ChatItem.ChatItemCount(props.count)}`}
		>
			<>
				<div className={styles["chat-item-title"]}>
					{props.title}
					{/* <span className={styles["chat-item-info"]}>
       {Locale.ChatItem.ChatItemCount(props.count)}
      </span> */}
				</div>
				<div className={styles["chat-item-date"]}>
					{`id: ${props.id} | ${props.time}`}
				</div>
			</>

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

			{/* Edit icon */}
			{props.onEdit && typeof props.onDelete === "function" && (
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
	);
}
