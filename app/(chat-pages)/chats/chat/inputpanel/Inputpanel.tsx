"use client";
import { useDebouncedCallback } from "use-debounce";
import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	Fragment,
	useContext,
	use,
	useCallback,
} from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Globe,
	Image,
	Mic,
	Network,
	Paperclip,
	Send,
	Settings,
	Sparkles,
	Upload as UploadIcon,
	X,
} from "lucide-react";
import { oss_base } from "@/app/constant";
import { FileInfo } from "@/app/client/platforms/utils";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import { useAppConfig, ModelType, useUserStore } from "@/app/store";

import {
	MULTI_AGENT_DEFAULT_TOPIC,
	useMultipleAgentStore,
} from "@/app/store/multiagents/index";
import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	getMessageTextContent,
	getMessageImages,
} from "@/app/utils";

import { Prompt, usePromptStore } from "@/app/store/prompt";
import Locale from "@/app/locales";

import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

import {
	CHAT_PAGE_SIZE,
	LAST_INPUT_KEY,
	MAX_RENDER_MSG_COUNT,
	Path,
	REQUEST_TIMEOUT_MS,
	UNFINISHED_INPUT,
	LAST_INPUT_IMAGE_KEY,
} from "@/app/constant";

import { List, message, Upload } from "antd";

import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "../../../../hooks/useGeneralChatHook";
import {
	startSpeechToText,
	convertTextToSpeech,
} from "@/app/utils/voicetotext";

import { createFromIconfontCN } from "@ant-design/icons";
export const IconFont = createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/c/font_4149808_awi8njsz19j.js",
});

import { ChatActions, SimpleChatActions } from "./components/chatactions";
import { DeleteImageButton, DeleteFileButton } from "./components/chatactions";
import { AttachImages } from "./components/AttachImages";

import {
	handlePasteEvent,
	uploadFile,
	uploadImage,
} from "./utils/fileUploader";
import { AttachFiles } from "./components/AttachFiles";
import { useDoSubmit } from "../hooks/useDoSubmit";
import { AppGeneralContext } from "@/app/contexts/AppContext";
import {
	useChatActions,
	useChatSetting,
	useSessions,
} from "../hooks/useChatContext";
import { sessionConfig } from "@/app/types/";

import { UploadFile } from "antd/es/upload/interface"; // 导入 UploadFile 类型
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
// 定义一个类型转换函数
const convertToUploadFile = (file: FileInfo): UploadFile<File> => ({
	uid: file.originalFilename, // 使用文件名作为 uid
	name: file.originalFilename,
	status: file.status,
	size: file.size,
	// 其他属性可以根据需要添加
});

export function Inputpanel(props: {
	index?: number;
	isworkflow: boolean;
	submitType?: "chat" | "workflow" | "multi-agent";
}) {
	const { index, isworkflow, submitType } = props;
	const config = useAppConfig();
	const multiAgentStore = useMultipleAgentStore.getState();
	const multipleagentConversation = multiAgentStore.currentSession();
	const sessions = useSessions(); // Call this hook unconditionally
	const { user } = useUserStore.getState();

	// Then use the result conditionally
	const session =
		submitType === "multi-agent" ? multipleagentConversation : sessions;

	const isMobileScreen = useContext(AppGeneralContext).isMobile;

	const promptStore = usePromptStore();

	const inputRef = useRef<HTMLTextAreaElement>(null);
	const autoFocus = !isMobileScreen;

	const [userInput, setUserInput] = useState("");
	const [inputRows, setInputRows] = useState(2);
	const [userImage, setUserImage] = useState<any>();
	const [attachImages, setAttachImages] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [attachFiles, setAttachFiles] = useState<FileInfo[]>([]);

	const { setHitBottom, setShowPromptModal, setEnableAutoFlow } =
		useChatActions();
	const { hitBottom, showPromptModal, enableAutoFlow } = useChatSetting();

	const { submitKey, shouldSubmit } = useSubmitHandler();

	const textareaMinHeight = userImage ? 121 : 68;
	const [messageApi, contextHolder] = message.useMessage();

	const handleError = (errorMessage: string) => {
		messageApi.error(errorMessage);
	};

	const { doSubmit, isLoading } = useDoSubmit(
		session,
		attachImages,
		attachFiles,
		props.submitType,
		handleError,
	);
	const handleSubmit = async () => {
		const currentInput = userInput; // 保存当前输入
		setUserInput(""); // 立即清空输入框
		await doSubmit(currentInput);
		setAttachImages([]);
		setAttachFiles([]);
		if (!isMobileScreen) inputRef.current?.focus();
	};

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (
			e.key === "ArrowUp" &&
			userInput.length === 0 &&
			!e.metaKey &&
			!e.altKey &&
			!e.ctrlKey
		) {
			setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
			setUserImage(localStorage.getItem(LAST_INPUT_IMAGE_KEY));
			e.preventDefault();
			return;
		}
		if (shouldSubmit(e)) {
			handleSubmit();
			e.preventDefault();
		}
	};

	const onInput = useCallback((text: string) => {
		// 简单的错误处理，防止输入过长
		setUserInput(text);
	}, []);

	const measure = useDebouncedCallback(
		() => {
			const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
			setInputRows(Math.min(20, Math.max(2 + Number(!isMobileScreen), rows)));
		},
		100,
		{ leading: true, trailing: true },
	);

	useEffect(measure, [userInput]);

	useEffect(() => {
		const key = UNFINISHED_INPUT(session?.id ?? "unkown");
		const mayBeUnfinishedInput = localStorage.getItem(key);
		if (mayBeUnfinishedInput && userInput.length === 0) {
			setUserInput(mayBeUnfinishedInput);
			localStorage.removeItem(key);
		}
		const dom = inputRef.current;
		return () => {
			localStorage.setItem(key, dom?.value ?? "");
		};
	}, [session?.id, userInput]);

	const handlePaste = useCallback(
		(event: React.ClipboardEvent<HTMLTextAreaElement>) => {
			handlePasteEvent(event, {
				attachImages,
				setAttachImages,
				setUploading,
			});
		},
		[attachImages],
	);

	// 上传图片 监听并输出图片console
	const handleUploadImage = useCallback(async () => {
		try {
			await uploadImage(setAttachImages);
		} catch (error) {
			console.error("上传图片失败:", error);
			// showToast(Locale.Chat.UploadImageFailed); // 假设showToast是一个显示提示信息的函数
		}
	}, [setAttachImages]);

	const handleUploadFile = useCallback(async (file: File) => {
		setUploading(true);
		try {
			console.log("handleUploadFile", file);
			const newFile = await uploadFile(file, session as ChatSession, user);
			setAttachFiles((prevFiles) => [...prevFiles, newFile]); // 追加新文件
		} catch (error) {
			message.error("上传文件失败");
		} finally {
			setUploading(false);
		}
	}, []);

	const customRequest = async (options: any) => {
		const file = options.file as File; // 将 file 转换为 File 类型
		try {
			await handleUploadFile(file); // 调用上传逻辑
			options.onSuccess(file); // 调用成功回调
		} catch (error) {
			options.onError(error); // 调用错误回调
		}
	};
	const handleSpeechRecognition = useCallback(async (): Promise<void> => {
		try {
			const text = await startSpeechToText();
			setUserInput((prev) => `${prev} ${text}`);
		} catch (error) {
			console.error("语音识别失败:", error);
			// showToast(Locale.Chat.SpeechRecognitionFailed); // 假设showToast是一个显示提示信息的函数
		}
	}, []);

	const handleShowPromptModal = useCallback(() => {
		setShowPromptModal(true);
	}, []);

	const handleimageSelected = useCallback(() => {
		setShowPromptModal(true);
	}, []);

	const handleRemove = (file: UploadFile<File>) => {
		setAttachFiles((prevFiles) =>
			prevFiles.filter((f) => f.originalFilename !== file.name),
		);
		message.success(`${file.name} 已被删除`);
	};

	return (
		<div className="flex flex-col gap-2 p-2">
			{contextHolder}

			{/* 工具栏 */}
			<div>
				{submitType === "multi-agent" ? (
					<SimpleChatActions
						uploadImage={handleUploadImage}
						uploading={uploading}
					/>
				) : (
					<ChatActions
						uploadImage={handleUploadImage}
						setAttachImages={setAttachImages}
						setAttachFiles={setAttachFiles}
						setUploading={setUploading}
						showPromptModal={handleShowPromptModal}
						hitBottom={hitBottom}
						uploading={uploading}
						session={session as sessionConfig}
						index={props.index}
						workflow={isworkflow}
					/>
				)}
			</div>

			{/* 输入区域 */}
			<TooltipProvider>
				<div className="relative">
					<Textarea
						ref={inputRef}
						placeholder={Locale.Chat.Input(submitKey)}
						value={userInput}
						onChange={(e) => onInput(e.target.value)}
						onKeyDown={onInputKeyDown}
						onPaste={handlePaste}
						rows={inputRows}
						className={cn(
							"min-h-[100px] resize-none pr-24",
							attachImages.length > 0 && "pb-20",
						)}
						style={{
							fontSize: config.fontSize,
						}}
					/>

					{/* 附件预览区域 */}
					<div className="absolute -bottom-6 left-0 w-full space-y-2">
						<Upload
							customRequest={customRequest}
							maxCount={3}
							accept=".doc,.docx,.md,.pdf,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.json,.xml"
							onRemove={handleRemove}
							className="w-full"
						>
							{/* {attachFiles.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{attachFiles.map((file, index) => (
										<Badge key={index} variant="secondary">
											{file.originalFilename}
											<X
												className="ml-1 h-3 w-3 cursor-pointer"
												onClick={(e) => {
													e.stopPropagation();
													handleRemove(convertToUploadFile(file));
												}}
											/>
										</Badge>
									))}
								</div>
							)} */}
						</Upload>

						<AttachImages
							attachImages={attachImages}
							setAttachImages={setAttachImages}
						/>
					</div>

					{/* 操作按钮 */}
					<div className="absolute bottom-2 right-2 flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() =>
										document
											.querySelector<HTMLInputElement>('input[type="file"]')
											?.click()
									}
								>
									<Paperclip className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>上传文档</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={handleUploadImage}
								>
									<Image className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>上传图片</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={handleSpeechRecognition}
								>
									<Mic className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>语音输入</TooltipContent>
						</Tooltip>

						<Button
							size="icon"
							className="h-8 w-8"
							onClick={handleSubmit}
							disabled={isLoading}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</TooltipProvider>
		</div>
	);
}
