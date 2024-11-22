// 文件路径: src/hooks/useAgentActions.ts

import { useCallback } from "react";
import { FileName, Path } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import { useMaskStore } from "../store/mask";
import { useUserStore } from "@/app/store";
import { useChatStore } from "@/app/store/chat/index";
import { Mask } from "@/app/types/mask";

export const useAgentActions = () => {
	const maskStore = useMaskStore();
	const userStore = useUserStore();
	const chatStore = useChatStore();
	const navigate = useNavigate();

	const onChat = useCallback(
		(mask: Mask) => {
			setTimeout(() => {
				chatStore.create(mask, userStore);
			}, 10);
			navigate(Path.Chat);
		},
		[chatStore, userStore],
	);

	const onDelete = useCallback(
		(mask: Mask) => {
			console.log("onDelete");
			maskStore.delete(mask.id);
		},
		[maskStore],
	);

	const addWorkflow = useCallback(() => {
		// Placeholder for addWorkflow method
	}, []);

	const addMultipleAgent = useCallback(() => {
		// Placeholder for addMultipleAgent method
	}, []);

	return {
		onChat,
		onDelete,
		addWorkflow,
		addMultipleAgent,
	};
};
