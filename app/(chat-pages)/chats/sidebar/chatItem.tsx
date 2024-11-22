import { useRef, useEffect, useState, useCallback } from "react";

import { DeleteIcon } from "@/app/icons";

import styles from "./sidebar.module.scss";

import { EditIcon } from "@/app/icons";
import { useChatStore } from "@/app/store/chat/index";

import Locale from "@/app/locales";

import Avatar from "@/app/components/avatar";
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
	const [isSliding, setIsSliding] = useState(false);
	const [slideDistance, setSlideDistance] = useState(0);
	const touchStartX = useRef(0);

	const resetSlide = useCallback(() => {
		setIsSliding(false);
		setSlideDistance(0);
	}, []);

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		const currentX = e.touches[0].clientX;
		const diff = touchStartX.current - currentX;
		if (diff > 0) {
			setIsSliding(true);
			setSlideDistance(Math.min(diff, 80)); // 最大滑动距离为80px
		} else if (diff < 0 && isSliding) {
			// 允许向右滑动来恢复原始状态
			setSlideDistance(Math.max(0, slideDistance + diff));
		}
	};

	const handleTouchEnd = () => {
		if (slideDistance < 40) {
			resetSlide();
		}
	};

	useEffect(() => {
		// 当用户点击其他地方时，恢复原始状态
		const handleClickOutside = (e: MouseEvent) => {
			if (
				isSliding &&
				e.target &&
				!(e.target as Element).closest(`.${styles["chat-item"]}`)
			) {
				resetSlide();
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isSliding, resetSlide]);

	if (props.narrow) return null;

	return (
		<div
			className={`${styles["chat-item"]} ${
				props.selected && styles["chat-item-selected"]
			}`}
			onClick={props.onClick}
			title={`${props.title}\n${Locale.ChatItem.ChatItemCount(props.count)}`}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			style={{
				transform: `translateX(-${slideDistance}px)`,
				transition: "transform 0.3s ease",
			}}
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

			{isSliding && (
				<div
					className={styles["chat-item-delete-mobile"]}
					style={{
						position: "absolute",
						right: 0,
						top: 0,
						bottom: 0,
						width: `${slideDistance}px`,
						backgroundColor: "darkred",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					onClick={(e) => {
						e.stopPropagation();
						props.onDelete && props.onDelete();
					}}
				>
					<DeleteIcon />
				</div>
			)}
		</div>
	);
}
