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
} from "react";
import { getISOLang, getLang } from "@/app/locales";
import { useRouter } from "next/navigation";

import SendWhiteIcon from "@/app/icons/send-white.svg";
import CopyIcon from "@/app/icons/copy.svg";
import PromptIcon from "@/app/icons/prompt.svg";
import ResetIcon from "@/app/icons/reload.svg";
import BreakIcon from "@/app/icons/break.svg";
import SettingsIcon from "@/app/icons/chat-settings.svg";
import LightIcon from "@/app/icons/light.svg";
import DarkIcon from "@/app/icons/dark.svg";
import AutoIcon from "@/app/icons/auto.svg";
import BottomIcon from "@/app/icons/bottom.svg";
import StopIcon from "@/app/icons/pause.svg";
import RobotIcon from "@/app/icons/robot.svg";
import Record from "@/app/icons/record.svg";
import UploadIcon from "@/app/icons/upload.svg";
import CloseIcon from "@/app/icons/close.svg";
import { oss } from "@/app/constant";
import CheckmarkIcon from "@/app/icons/checkmark.svg";

import {
	PauseOutlined,
	PlayCircleOutlined,
	DeleteOutlined,
	HeartTwoTone,
} from "@ant-design/icons";

import {
	SubmitKey,
	useChatStore,
	BOT_HELLO,
	createMessage,
	useAccessStore,
	Theme,
	useAppConfig,
	ModelType,
	useUserStore,
} from "@/app/store";

import { ChatSession, Mask, ChatMessage, ChatToolMessage } from "@/app//types/";

import { DOUBLE_AGENT_DEFAULT_TOPIC } from "@/app/store/doubleAgents";
import {
	copyToClipboard,
	selectOrCopy,
	autoGrowTextArea,
	useMobileScreen,
} from "@/app/utils";

import Locale from "@/app/locales";

import { IconButton } from "@/app/components/button";
import styles from "@/app/(chat-pages)/chats/chat/chats.module.scss";

import useAuth from "@/app/hooks/useAuth";
import { message } from "antd";

import {
	useSubmitHandler,
	useScrollToBottom,
	ClearContextDivider,
} from "@/app/(chat-pages)/chats/chat/chat-controller";

import useDoubleAgentStore, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import { Button, Input, InputNumber, Flex } from "antd";
import {
	continueConversation,
	startConversation,
} from "@/app/services/doubleAgentService";
import Icon from "@ant-design/icons/lib/components/Icon";

export function DoubleAgentInput() {
	const doubleAgentStore = useDoubleAgentStore();
	const { conversations, currentConversationId } = doubleAgentStore;
	const [conversation, setConversation] = useState<
		DoubleAgentChatSession | undefined
	>(conversations.find((conv) => conv.id === currentConversationId));

	const authHook = useAuth();
	const { updateUserInfo } = authHook;
	const [messageApi, contextHolder] = message.useMessage();
	const { submitKey, shouldSubmit } = useSubmitHandler();
	const userid = useUserStore.getState().user.id;
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const [userInput, setUserInput] = useState("");
	const [inputRows, setInputRows] = useState(2);
	const [paused, setPaused] = useState(conversation?.paused ?? false);
	const [round, setRound] = useState(conversation?.round ?? 0);
	const [totalRounds, setTotalRounds] = useState(
		conversation?.totalRounds ?? 0,
	);
	const { chat_balance } = useUserStore.getState().user.user_balance;

	const config = useAppConfig();
	useEffect(() => {
		// 这里可以做一些初始化的工作
		// 比如设置对话轮数
		if (!conversation) {
			return;
		}
		// 当 conversations 或 currentConversationId 发生变化时更新 conversation
		const updatedConversation = conversations.find(
			(conv) => conv.id === currentConversationId,
		);
		setConversation(updatedConversation);
		setTotalRounds(updatedConversation?.totalRounds ?? 0);
		setRound(updatedConversation?.round ?? 0);
		setPaused(updatedConversation?.paused ?? false);
	}, [conversations, currentConversationId]); // 添加依赖数组

	//  当rounds 变化时 updateUserBalance
	useEffect(() => {
		// 更新用户余额
		updateUserInfo(userid);
	}, [round]);

	const textareaMinHeight = 68;
	const onInput = (text: string) => {
		setUserInput(text);
		const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
		const inputRows = Math.min(20, Math.max(2, rows));
		setInputRows(inputRows);
	};

	const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// submit
		if (shouldSubmit(e)) {
			// 提交对话
			startConversationHandler();
			console.log("提交对话");
		}
	};

	if (!conversation) {
		return;
	}

	const roundHandler = (e: number | null) => {
		// 设置对话轮数
		console.log(e);
		// change input value to number
		const value = e;
		// 创建新的conversation, 并更新
		const newConversation: DoubleAgentChatSession = {
			...conversation,
			totalRounds: value ?? 0,
		};
		doubleAgentStore.updateConversation(currentConversationId, newConversation);
	};

	const clearConversationHandler = () => {
		console.log(currentConversationId);
		doubleAgentStore.clearConversation(currentConversationId);
		setUserInput("");
		setRound(0);
	};

	const togglePauseHandler = () => {
		// 如果 round >= totalRounds, 则自动暂停
		if (round >= totalRounds) {
			const newPausedState = true;
			const updatedConversation: DoubleAgentChatSession = {
				...conversation,
				paused: newPausedState,
			};
			doubleAgentStore.updateConversation(
				currentConversationId,
				updatedConversation,
			);
			return;
		}

		// 根据当前的 paused 状态来暂停或继续对话
		const newPausedState = !conversation.paused;
		const updatedConversation: DoubleAgentChatSession = {
			...conversation,
			paused: newPausedState,
		};
		doubleAgentStore.updateConversation(
			currentConversationId,
			updatedConversation,
		);
		// 如果pause 状态为false, 则继续对话
		if (!newPausedState) {
			continueConversation(currentConversationId, round);
		}
	};

	const startConversationHandler = () => {
		// 提交异常处理
		// 对话轮数超过总轮数
		// 信息为空
		// 信息长度超过限制
		// agent 未设定
		// 用户余额不足
		// 用户未登录

		if (userInput.length === 0) {
			messageApi.error("信息不能为空");
			return null;
		}
		if (userInput.length > 1000) {
			messageApi.error("信息长度超过限制");
			return null;
		}
		if (round >= totalRounds) {
			console.log("rounds", round, totalRounds);
			messageApi.error("对话轮数超过总轮数");
			return null;
		}
		if (userid === 0) {
			messageApi.error("用户未登录");
			return null;
		}

		//  check firstAIConfig and secondAIConfig object is not empty
		if (
			!conversation.firstAIConfig.modelConfig ||
			!conversation.secondAIConfig.modelConfig
		) {
			messageApi.error("agent 未设定");
			return null;
		}

		// 开始对话

		//更新 pause 状态
		const newPausedState = false;

		const userId = 1;
		const initialinput = userInput;
		const updateConversation: DoubleAgentChatSession = {
			...conversation,
			topic:
				conversation.topic == DOUBLE_AGENT_DEFAULT_TOPIC
					? userInput
					: conversation.topic,
			initialInput: userInput,
			paused: newPausedState,
			lastUpdateTime: new Date().getTime(),
		};
		console.log("conversation", updateConversation);
		console.log("开始对话");
		doubleAgentStore.updateConversation(
			currentConversationId,
			updateConversation,
		);

		// 提交对话
		startConversation(currentConversationId, initialinput);
		setUserInput("");
	};

	if (!conversation) {
		return null;
	}

	return (
		<div className={styles["chat-input-panel"]}>
			{contextHolder}
			<Flex
				wrap="wrap"
				gap={"small"}
				align="center"
				style={{ marginBottom: 12 }}
			>
				{/* 自动对话轮数输入 */}

				<InputNumber
					// addonBefore="对话"
					defaultValue={totalRounds}
					min={0}
					prefix="总轮:"
					onChange={(e) => roundHandler(e)}
					style={{ width: "185px" }}
					addonAfter={`当前第 ${conversation.round} 轮`}
					keyboard={true}
				/>
				{/* 控制器图标按钮 */}

				{paused ? (
					<Button
						type="primary"
						icon={<PlayCircleOutlined />}
						onClick={togglePauseHandler}
						ghost
					/>
				) : (
					<Button
						type="primary"
						icon={<PauseOutlined />}
						onClick={togglePauseHandler}
						ghost
					/>
				)}

				<Button
					icon={<DeleteOutlined />}
					type="primary"
					onClick={clearConversationHandler}
					danger
					ghost
				>
					清空
				</Button>
				<div>
					{/* 展示用户余额 */}
					<span className={styles["chat-balance"]}>
						对话余额: {chat_balance}
					</span>
				</div>
			</Flex>
			<div className={styles["chat-input-panel-inner"]}>
				<textarea
					ref={inputRef}
					className={styles["chat-input"]}
					placeholder={Locale.Chat.Input(submitKey)}
					onInput={(e) => onInput(e.currentTarget.value)}
					value={userInput}
					onKeyDown={onInputKeyDown}
					rows={inputRows}
					style={{
						fontSize: config.fontSize,
						minHeight: textareaMinHeight,
					}}
				></textarea>
				<IconButton
					icon={<SendWhiteIcon />}
					text=""
					className={styles["chat-input-send"]}
					type="primary"
					onClick={startConversationHandler}
				/>
			</div>
		</div>
	);
}
