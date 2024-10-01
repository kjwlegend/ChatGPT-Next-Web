"use client";
import React, { useRef } from "react";
import { createFromIconfontCN } from "@ant-design/icons";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { Prompt } from "@/app/store/prompt";

export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

export type RenderPompt = Pick<Prompt, "title" | "content">;

export function PromptHints(props: {
	prompts: RenderPompt[];
	onPromptSelect: (prompt: RenderPompt) => void;
}) {
	const selectedRef = useRef<HTMLDivElement>(null);
	const { selectIndex, setSelectIndex } = useKeyboardNavigation(
		props.prompts,
		props.onPromptSelect,
		selectedRef,
	);

	if (props.prompts.length === 0) return null;

	return (
		<div className={styles["prompt-hints"]}>
			{props.prompts.map((prompt, i) => (
				<div
					ref={i === selectIndex ? selectedRef : null}
					className={`${styles["prompt-hint"]} ${
						i === selectIndex ? styles["prompt-hint-selected"] : ""
					}`}
					key={prompt.title + i.toString()}
					onClick={() => props.onPromptSelect(prompt)}
					onMouseEnter={() => setSelectIndex(i)}
				>
					<div className={styles["hint-title"]}>{prompt.title}</div>
					<div className={styles["hint-content"]}>{prompt.content}</div>
				</div>
			))}
		</div>
	);
}
