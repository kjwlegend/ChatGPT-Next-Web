import { useRef } from "react";
import { useChatCommand } from "@/app/command";
import { useChatStore } from "@/app/store";

export function usePromptSelect(setUserInput: (input: string) => void) {
	const chatStore = useChatStore.getState();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const chatCommands = useChatCommand({
		new: () => chatStore.newSession(),
		prev: () => chatStore.nextSession(-1),
		next: () => chatStore.nextSession(1),
		clear: () =>
			chatStore.updateSession(
				session.id,
				() => (session.clearContextIndex = session.messages.length),
			),
		del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
	});

	const onPromptSelect = (prompt: RenderPompt) => {
		setTimeout(() => {
			setPromptHints([]);

			const matchedChatCommand = chatCommands.match(prompt.content);
			if (matchedChatCommand.matched) {
				matchedChatCommand.invoke();
				setUserInput("");
			} else {
				setUserInput(prompt.content);
			}
			inputRef.current?.focus();
		}, 30);
	};

	return {
		onPromptSelect,
		inputRef,
	};
}
