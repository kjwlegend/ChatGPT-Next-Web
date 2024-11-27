import { useState, useCallback } from "react";
import { getChatSessionMessages } from "@/app/services/api/chats";
import { UpdateChatMessages } from "../hooks/useChatHook";

export function useMessageLoader(sessionId: string) {
	const [messageLoading, setMessageLoading] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	const loadMoreMessages = useCallback(async () => {
		if (messageLoading || !hasNextPage) return;

		try {
			setMessageLoading(true);
			const param = {
				limit: 20,
				page: currentPage + 1,
			};

			const response = await getChatSessionMessages(param, sessionId);
			const messages = response.data;

			if (messages.length === 0) {
				setHasNextPage(false);
			} else {
				UpdateChatMessages(sessionId, messages);
				setCurrentPage((prev) => prev + 1);
			}
		} catch (error) {
			console.error("Failed to load messages:", error);
			setHasNextPage(false);
		} finally {
			setMessageLoading(false);
		}
	}, [sessionId, currentPage, messageLoading, hasNextPage]);

	return {
		messageLoading,
		hasNextPage,
		loadMoreMessages,
	};
}
