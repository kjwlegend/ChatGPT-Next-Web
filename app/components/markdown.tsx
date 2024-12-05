import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect, useMemo } from "react";
import { copyToClipboard } from "../utils";
import mermaid from "mermaid";

import LoadingIcon from "@/app/icons/three-dots.svg";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { showImageModal } from "./ui-lib";

import { Modal } from "@/app/components/ui-lib"; // 确保你有一个 Modal 组件
import { Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export function Mermaid(props: { code: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (props.code && ref.current) {
			mermaid
				.run({
					nodes: [ref.current],
					suppressErrors: true,
				})
				.catch((e) => {
					setHasError(true);
					console.error("[Mermaid] ", e.message);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.code]);

	function viewSvgInNewWindow() {
		const svg = ref.current?.querySelector("svg");
		if (!svg) return;
		const text = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([text], { type: "image/svg+xml" });
		showImageModal(URL.createObjectURL(blob));
	}

	if (hasError) {
		return null;
	}

	return (
		<div
			className="no-dark mermaid"
			style={{
				cursor: "pointer",
				overflow: "auto",
			}}
			ref={ref}
			onClick={() => viewSvgInNewWindow()}
		>
			{props.code}
		</div>
	);
}

export function PreCode(props: { children: any }) {
	const ref = useRef<HTMLPreElement>(null);
	const refText = ref.current?.innerText;
	const [mermaidCode, setMermaidCode] = useState("");
	const [viewerOpen, setViewerOpen] = useState(false);
	const [codeType, setCodeType] = useState<"svg" | "html" | null>(null);

	const renderMermaid = useDebouncedCallback(() => {
		if (!ref.current) return;
		const mermaidDom = ref.current.querySelector("code.language-mermaid");
		if (mermaidDom) {
			setMermaidCode((mermaidDom as HTMLElement).innerText);
		}
	}, 600);

	const handleView = () => {
		if (!ref.current) return;
		const code = ref.current.innerText;
		const codeClass = ref.current.querySelector("code")?.className || "";

		if (codeClass.includes("language-svg")) {
			setCodeType("svg");
			setViewerOpen(true);
		} else if (codeClass.includes("language-html")) {
			setCodeType("html");
			setViewerOpen(true);
		}
	};

	useEffect(() => {
		setTimeout(renderMermaid, 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refText]);

	const getCodeLanguage = () => {
		if (!ref.current) return null;
		const codeElement = ref.current.querySelector("code");
		if (codeElement?.className.includes("language-svg")) return "svg";
		if (codeElement?.className.includes("language-html")) return "html";
		return null;
	};

	return (
		<>
			{mermaidCode.length > 0 && (
				<Mermaid code={mermaidCode} key={mermaidCode} />
			)}
			<pre ref={ref} className="group relative">
				<div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
					<Button
						variant="outline"
						size="icon"
						className="h-6 w-6 border-none bg-transparent hover:bg-black/20 hover:text-white"
						onClick={() => {
							if (ref.current) {
								copyToClipboard(ref.current.innerText);
							}
						}}
					>
						<Copy className="h-4 w-4" />
					</Button>
					{getCodeLanguage() && (
						<Button
							variant="outline"
							size="sm"
							className="h-6 bg-transparent hover:bg-black/20 hover:text-white"
							onClick={handleView}
						>
							Preview
						</Button>
					)}
				</div>
				{props.children}
			</pre>

			<Dialog open={viewerOpen} onOpenChange={(open) => setViewerOpen(open)}>
				<DialogContent className="h-[80vh] max-w-3xl">
					<DialogHeader>
						<DialogTitle className="flex items-center justify-between">
							{`${codeType?.toUpperCase()} Preview`}
						</DialogTitle>
					</DialogHeader>
					<div className="h-full overflow-auto">
						{codeType === "svg" ? (
							<div
								dangerouslySetInnerHTML={{
									__html: ref.current?.innerText || "",
								}}
								className="flex items-center justify-center rounded bg-white p-4"
							/>
						) : (
							<div className="overflow-hidden rounded bg-white">
								<iframe
									srcDoc={ref.current?.innerText || ""}
									className="h-full min-h-[50vh] w-full border-0"
									sandbox="allow-scripts allow-same-origin"
									title="HTML Preview"
								/>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
function escapeBrackets(text: string) {
	const pattern =
		/(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
	return text.replace(
		pattern,
		(match, codeBlock, squareBracket, roundBracket) => {
			if (codeBlock) {
				return codeBlock; // 保持代码块不变
			} else if (squareBracket) {
				return `$$${squareBracket}$$`; // 将 \[...\] 转换为 $$...$$
			} else if (roundBracket) {
				return `$${roundBracket}$`; // 将 \(...\) 转换为 $...$
			}
			return match;
		},
	);
}
function escapeDollarNumber(text: string) {
	let escapedText = "";

	for (let i = 0; i < text.length; i += 1) {
		let char = text[i];
		const nextChar = text[i + 1] || " ";

		if (char === "$" && nextChar >= "0" && nextChar <= "9") {
			char = "\\$";
		}

		escapedText += char;
	}

	return escapedText;
}
function MarkdownWrapper(props: { content: string; imageBase64?: string }) {
	const escapedContent = useMemo(() => {
		return escapeBrackets(escapeDollarNumber(props.content));
	}, [props.content]);

	return (
		<div style={{ fontSize: "inherit" }}>
			{/* {props.imageBase64 && <img src={props.imageBase64} alt="" />} */}
			<ReactMarkdown
				remarkPlugins={[RemarkMath as any, RemarkGfm, RemarkBreaks]}
				rehypePlugins={
					[
						RehypeKatex,
						[
							RehypeHighlight,
							{
								detect: false,
								ignoreMissing: true,
							},
						],
					] as any
				}
				components={{
					pre: PreCode as any,
					p: (pProps) => <p {...pProps} dir="auto" />,
					code: ({ node, inline, className, children, ...props }) => {
						const match = /language-(\w+)/.exec(className || "");
						const lang = match && match[1];

						if (lang === "svg" || lang === "html") {
							return (
								<code className={className} {...props}>
									{children}
								</code>
							);
						}

						return (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
					a: (aProps) => {
						const href = aProps.href || "";
						const isInternal = /^\/#/i.test(href);
						const target = isInternal ? "_self" : (aProps.target ?? "_blank");
						return (
							<a
								{...aProps}
								target={target}
								rel={isInternal ? undefined : "noopener noreferrer"}
							/>
						);
					},
				}}
			>
				{escapedContent}
			</ReactMarkdown>
		</div>
	);
}

export const MarkdownContent = React.memo(MarkdownWrapper);

export function Markdown(
	props: {
		content: string;
		loading?: boolean;
		fontSize?: number;
		imageBase64?: string;
	} & React.DOMAttributes<HTMLDivElement>,
) {
	const mdRef = useRef<HTMLDivElement>(null);
	return (
		<div
			className="markdown-body"
			style={{
				fontSize: `${props.fontSize ?? 14}px`,
			}}
			ref={mdRef}
			onContextMenu={props.onContextMenu}
			onDoubleClickCapture={props.onDoubleClickCapture}
			dir="auto"
		>
			{props.loading ? (
				<LoadingIcon />
			) : (
				<MarkdownContent
					content={props.content}
					imageBase64={props.imageBase64}
				/>
			)}
		</div>
	);
}
