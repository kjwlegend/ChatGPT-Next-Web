import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Code, Database } from "lucide-react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { ToolOutlined } from "@ant-design/icons";
import { ChatToolMessage } from "@/app/types/chat";

interface MessageToolContentProps {
	toolMessages: ChatToolMessage[];
}

const ToolIcon = ({
	toolName,
	className,
}: {
	toolName: string;
	className?: string;
}) => {
	const defaultClassName = "h-4 w-4";
	const finalClassName = className || defaultClassName;

	switch (toolName) {
		case "web-search":
		case "google-search":
		case "搜索引擎":
			return <Search className={finalClassName} />;
		case "code-generator":
			return <Code className={finalClassName} />;
		case "vector-store":
			return <Database className={finalClassName} />;
		default:
			return <ToolOutlined className={finalClassName} />;
	}
};

const MessageToolContent: React.FC<MessageToolContentProps> = ({
	toolMessages,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [showFullTitle, setShowFullTitle] = useState<Record<number, boolean>>(
		{},
	);

	const toggleTitleExpand = (index: number) => {
		setShowFullTitle((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	return (
		<div className="mb-2 space-y-3">
			{toolMessages.map((tool, index) => (
				<Card
					key={index}
					className="my-2 border border-secondary/10 bg-gradient-to-b from-secondary/5 to-secondary/10 p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md"
				>
					<div className="mb-1 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-1">
								<ToolIcon
									toolName={tool.toolName}
									className="h-3 w-3 text-primary/80"
								/>
							</div>
							<div className="flex flex-row items-center gap-1">
								<span className="text-sm font-medium text-secondary-foreground">
									{tool.toolName}
								</span>
								<span className="text-xs text-muted-foreground">
									{tool.toolInput}
								</span>
							</div>
						</div>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="rounded-full p-1.5 transition-all duration-200 hover:scale-105 hover:bg-secondary/20 active:scale-95"
						>
							{isExpanded ? (
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							)}
						</button>
					</div>

					{isExpanded && tool.references && tool.references.length > 0 && (
						<div className="mt-2 space-y-1">
							{tool.references.map((ref, index) => (
								<div
									key={index}
									className="group relative rounded-lg border border-secondary/10 bg-background/50 p-2 transition-all duration-200 hover:bg-secondary/5 hover:shadow-sm"
								>
									<div className="flex items-center gap-3">
										<Badge
											variant="outline"
											className="shrink-0 bg-primary/5 text-xs font-normal"
										>
											{index + 1}
										</Badge>
										<div className="min-w-0 flex-1">
											{ref.title && (
												<div
													className={`${
														!showFullTitle[index] ? "line-clamp-1" : ""
													} cursor-pointer text-xs font-medium transition-colors hover:text-primary`}
													onClick={() => toggleTitleExpand(index)}
												>
													{ref.title}
												</div>
											)}
											<a
												href={ref.url}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-1 inline-flex w-full items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-primary group-hover:underline"
											>
												<ExternalLink className="h-3 w-3" />
												<span className="truncate">{ref.url}</span>
											</a>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</Card>
			))}
		</div>
	);
};

export default MessageToolContent;
