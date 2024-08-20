import { useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePromptStore } from "@/app/store/prompt";
import { RenderPompt } from "./prompthints";

export function usePromptSearch() {
	const promptStore = usePromptStore();
	const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);

	const onSearch = useDebouncedCallback(
		(text: string) => {
			const matchedPrompts = promptStore.search(text);
			setPromptHints(matchedPrompts);
		},
		100,
		{ leading: true, trailing: true },
	);

	return {
		promptHints,
		onSearch,
		setPromptHints,
	};
}
