import React from "react";
import {
	RefreshCcw,
	Trash2,
	Pin,
	Copy,
	ChevronRight,
	Play,
	Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Locale from "@/app/locales";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

interface MessageActionsProps {
	showActions: boolean;
	isStreaming: boolean;
	isError: boolean;
	isWorkflow: boolean;
	onResend: () => void;
	onDelete: () => void;
	onPin: () => void;
	onCopy: () => void;
	onNext?: () => void;
	onStop?: () => void;
	onPlay?: () => void;
	isRoleplay?: boolean;
	isUser?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
	showActions,
	isStreaming,
	isError,
	isWorkflow,
	onResend,
	onDelete,
	onPin,
	onCopy,
	onNext,
	onStop,
	onPlay,
	isRoleplay,
	isUser,
}) => {
	if (!showActions || isError) return null;

	if (isStreaming) {
		return (
			<div className="flex items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={onStop || (() => {})}
							>
								<Square className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{Locale.Chat.Actions.Stop}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-1">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onResend}
						>
							<RefreshCcw className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{Locale.Chat.Actions.Retry}</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onDelete}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{Locale.Chat.Actions.Delete}</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onPin}
						>
							<Pin className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{Locale.Chat.Actions.Pin}</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={onCopy}
						>
							<Copy className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{Locale.Chat.Actions.Copy}</p>
					</TooltipContent>
				</Tooltip>

				{isWorkflow && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={onNext || (() => {})}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{Locale.Chat.Actions.Next}</p>
						</TooltipContent>
					</Tooltip>
				)}

				{isRoleplay && !isUser && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={onPlay || (() => {})}
							>
								<Play className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{Locale.Chat.Actions.Play}</p>
						</TooltipContent>
					</Tooltip>
				)}
			</TooltipProvider>
		</div>
	);
};

export default MessageActions;
