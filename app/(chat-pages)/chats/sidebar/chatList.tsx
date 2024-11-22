import styles from "../home.module.scss";

import { useRef, useEffect, useState, useCallback, memo } from "react";

import { ChatItem } from "./chatItem";
import { useChatStore } from "@/app/store/chat/index";

interface ChatListProps {
	narrow?: boolean;
	chatSessions: any[];
	onChatItemClick: (id: string) => void;
	onChatItemDelete: (id: number) => void;
	onChatItemEdit?: (id: string) => void;
}

const ChatList = ({
	narrow,
	chatSessions,
	onChatItemClick,
	onChatItemDelete,
	onChatItemEdit,
}: ChatListProps) => {
	const chatlist = chatSessions;
	const { currentSessionId } = useChatStore();
	// console.log("debug: currentSessionId", currentSessionId);

	const [selectedChatId, setSelectedChatId] = useState<string | null>(
		currentSessionId,
	); // 管理选中的聊天项

	useEffect(() => {
		setSelectedChatId(currentSessionId);
	}, [currentSessionId]);

	const handleChatItemClick = (id: string) => {
		// console.log("debug: handleChatItemClick", id);
		setSelectedChatId(id); // 更新选中的聊天项
		onChatItemClick(id); // 调用外部的点击处理函数
	};

	return (
		<div className={styles["chat-list"]}>
			{chatlist.length === 0 ? (
				<div className={styles["no-conversations"]}>暂无对话</div>
			) : (
				chatlist.map((item, i) => (
					<ChatItem
						title={item.topic}
						time={
							new Date(item.lastUpdateTime).toLocaleDateString(undefined, {
								month: "2-digit",
								day: "2-digit",
							}) +
							" " +
							new Date(item.lastUpdateTime).toLocaleTimeString(undefined, {
								hour: "2-digit",
								minute: "2-digit",
							})
						}
						count={item.chat_count ? item.messages.length : 0}
						key={item.id}
						id={item.id}
						index={i}
						selected={item.id === selectedChatId}
						onClick={() => handleChatItemClick(item.id)} // 处理点击事件
						onDelete={() => onChatItemDelete(item.id)}
						onEdit={onChatItemEdit ? () => onChatItemEdit(item.id) : undefined} // 传递可选的 onEdit
						narrow={narrow}
						mask={item.mask}
					/>
				))
			)}
		</div>
	);
};

export default memo(ChatList);
