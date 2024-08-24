import { useState, useMemo, useCallback, useEffect, useContext } from "react";
import { ChatContext } from "../main";
import { useUserStore } from "@/app/store"; // 确保路径正确
import { RenderMessage } from "./MessageList"; // 确保路径正确，RenderMessage 应从 MessageList 导入
import { getChat } from "@/app/api/backend/chat";
import { ChatMessage, ChatSession } from "@/app/types/chat";

export const useChatPagination = (
	sessionId: string,
	initialPageSize: number,
	CHAT_PAGE_SIZE: number,
) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [messages2, setMessages] = useState<ChatMessage[]>([]);
	const userStore = useUserStore.getState();
	const fetchMessages = useCallback(
		async (page: number) => {
			// 这里应该是获取消息的 API 调用
			try {
				const response = await getChat({
					user: userStore.user.id,
					chat_session: sessionId,
					page: page,
					limit: CHAT_PAGE_SIZE,
				});
				if (response.data) {
					// 假设 API 返回的数据是一个对象，其中包含消息列表和是否有下一页的标识
					setMessages((prevMessages) => [...response.data, ...prevMessages]);
					setHasNextPage(response.is_next);
				}
			} catch (error) {
				console.error("Failed to fetch messages:", error);
			}
		},
		[sessionId, CHAT_PAGE_SIZE],
	);

	useEffect(() => {
		fetchMessages(currentPage);
	}, [currentPage, fetchMessages]);

	// Handle scroll event
	const handleScroll = useCallback(
		(event: any) => {
			const { scrollTop, clientHeight, scrollHeight } = event.target;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollHeight - scrollTop === clientHeight;

			if (isAtTop && currentPage > 1) {
				setCurrentPage((page) => page - 1);
			} else if (isAtBottom && hasNextPage) {
				setCurrentPage((page) => page + 1);
			}
		},
		[currentPage, hasNextPage],
	);

	return { messages2, handleScroll };
};
