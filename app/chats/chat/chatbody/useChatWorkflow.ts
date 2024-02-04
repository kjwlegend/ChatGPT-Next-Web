// useChatWorkflow.ts
import { useState, useCallback } from "react";
import { ChatMessage } from "@/app/store";

interface IUseChatWorkflow {
	sendMessage: (content: string) => void;
	messages: ChatMessage[];
	addNewMessage: (newMessage: ChatMessage) => void;
}

export const useChatWorkflow = (): IUseChatWorkflow => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	// 假设的消息发送逻辑
	const sendMessage = useCallback((content: string) => {
		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			date: Date.now().toString(),
			content,
			role: "user",
			// 其他消息属性
		};
		setMessages((prevMessages) => [...prevMessages, newMessage]);
	}, []);

	const addNewMessage = useCallback((newMessage: ChatMessage) => {
		setMessages((prevMessages) => [...prevMessages, newMessage]);
	}, []);

	return { sendMessage, messages, addNewMessage };
};
