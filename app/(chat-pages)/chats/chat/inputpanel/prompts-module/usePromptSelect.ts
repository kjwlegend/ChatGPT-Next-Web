import { useRef, useCallback } from "react";
import { useChatCommand } from "@/app/command";
import { useChatStore } from "@/app/store";
import { RenderPompt } from "./prompthints";

export function usePromptSelect(
	setUserInput: (input: string) => void,
	setPromptHints: (hints: RenderPompt[]) => void,
) {
	const chatStore = useChatStore.getState();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const chatCommands = useChatCommand({
		new: () => chatStore.newSession(),
		prev: () => chatStore.nextSession(-1),
		next: () => chatStore.nextSession(1),
		clear: () =>
			chatStore.updateSession(chatStore.currentSession().id, (session) => {
				session.clearContextIndex = session.messages.length;
				return session;
			}),
		del: () => chatStore.deleteSession(chatStore.currentSessionId),
	});

	const onPromptSelect = useCallback(
		(prompt: RenderPompt) => {
			setTimeout(() => {
				setPromptHints([]);

				try {
					const matchedChatCommand = chatCommands.match(prompt.content);
					if (matchedChatCommand.matched) {
						matchedChatCommand.invoke();
						setUserInput("");
					} else {
						setUserInput(prompt.content);
					}
				} catch (error) {
					console.error("Error processing prompt:", error);
					setUserInput(prompt.content);
				}

				inputRef.current?.focus();
			}, 30);
		},
		[setPromptHints, setUserInput, chatCommands],
	);

	return {
		onPromptSelect,
		inputRef,
	};
}
