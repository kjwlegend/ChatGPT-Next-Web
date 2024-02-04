// ChatInput.tsx
import React, { useState } from "react";

interface IChatInputProps {
	onSendMessage: (content: string) => void;
}

export const ChatInput: React.FC<IChatInputProps> = ({ onSendMessage }) => {
	const [inputValue, setInputValue] = useState("");

	const handleSend = () => {
		onSendMessage(inputValue);
		setInputValue("");
	};

	return (
		<div>
			<input
				type="text"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
			/>
			<button onClick={handleSend}>Send</button>
		</div>
	);
};
