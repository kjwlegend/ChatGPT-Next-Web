import { useState, useCallback } from "react";

export function useChatScroll() {
	const [autoScroll, setAutoScroll] = useState(true);

	const scrollToBottom = useCallback((element: HTMLElement) => {
		const scrollHeight = element.scrollHeight;
		if (scrollHeight > element.scrollTop + element.clientHeight) {
			const scroll = () => {
				try {
					element.scrollTo({
						top: scrollHeight,
						behavior: "smooth",
					});
				} catch (error) {
					console.error("Failed to scroll to bottom:", error);
				}
			};
			requestAnimationFrame(scroll);
		}
	}, []);

	return {
		autoScroll,
		setAutoScroll,
		scrollToBottom,
	};
}
