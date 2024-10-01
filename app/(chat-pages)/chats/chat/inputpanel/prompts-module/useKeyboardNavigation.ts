import { useState, useEffect, RefObject } from "react";
import { RenderPompt } from "./prompthints";

export function useKeyboardNavigation(
	prompts: RenderPompt[],
	onPromptSelect: (prompt: RenderPompt) => void,
	selectedRef: RefObject<HTMLDivElement>,
) {
	const [selectIndex, setSelectIndex] = useState(0);

	useEffect(() => {
		setSelectIndex(0);
	}, [prompts.length]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (prompts.length === 0 || e.metaKey || e.altKey || e.ctrlKey) {
				return;
			}

			const changeIndex = (delta: number) => {
				e.stopPropagation();
				e.preventDefault();
				const nextIndex = Math.max(
					0,
					Math.min(prompts.length - 1, selectIndex + delta),
				);
				setSelectIndex(nextIndex);
				selectedRef.current?.scrollIntoView({
					block: "center",
				});
			};

			if (e.key === "ArrowUp") {
				changeIndex(-1);
			} else if (e.key === "ArrowDown") {
				changeIndex(1);
			} else if (e.key === "Enter") {
				const selectedPrompt = prompts[selectIndex];
				if (selectedPrompt) {
					onPromptSelect(selectedPrompt);
				}
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [prompts, selectIndex, onPromptSelect, selectedRef]);

	return { selectIndex, setSelectIndex };
}
