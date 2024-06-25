"use client";

import React, {
	useState,
	useRef,
	useEffect,
	useMemo,
	Fragment,
	useContext,
	use,
} from "react";

import { ChatMessage, ChatSession } from "@/app/types/chat";

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

import { message, Switch, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import styles from "./chats.module.scss";
import { isProModel } from "@/app/utils";

// an antd switch component that can be used to toggle to switch chat LLM model

export function LLMModelSwitch(props: { session: ChatSession }) {
	const config = useAppConfig();
	const user = useUserStore();
	const chatStore = useChatStore();
	const [messageApi, contextHolder] = message.useMessage();

	const session = props.session ? props.session : chatStore.currentSession();
	// console.log("session", session);

	const sessionId = session.id;

	const model = session.mask.modelConfig.model;

	const unCheckedChildrenText = "基础模型";
	const checkedChildrenText = "高级模型";
	const [modelType, setModelType] = useState<"基础" | "高级">("基础");

	const [cost, setCost] = useState(1);
	const [checked, setChecked] = useState(false);
	const [showSwitch, setShowSwitch] = useState(false);
	const [disabled, setDisabled] = useState(false);

	const handleModelChange = (model: any) => {
		// 设置模型类型和成本
		const isPro = isProModel(model);
		const modelType = isPro ? "高级" : "基础";
		const cost = isPro ? 5 : 1;

		// 更新会话模型配置
		chatStore.updateSession(sessionId, (session) => {
			session.mask.modelConfig.model = model;
			return session;
		});

		// 显示消息
		messageApi.success(
			`已切换到${modelType}模型，${
				modelType == "高级" ? "该模型具备更好的回答质量, " : ""
			}消耗${cost}积分/次.`,
		);
	};

	const handleSwitch = async (checked: boolean) => {
		setChecked(checked);
		setCost(checked ? 5 : 1);

		// 更新模型
		const newModel = checked ? "gpt-4o" : "gpt-3.5-turbo";
		await handleModelChange(newModel);
	};

	useEffect(() => {
		// 根据模型类型显示或隐藏切换按钮
		setShowSwitch(model !== "midjourney");

		const isPro = isProModel(model);

		// 根据模型类型设置选中状态、模型类型和成本
		const modelType = isPro ? "高级" : "基础";
		const cost = isPro ? 5 : 1;
		setChecked(isPro);
		setModelType(modelType);
		setCost(cost);

		// 打印当前模型类型、选中状态和成本
		console.log("modelType", modelType, checked, cost);
	}, [model]);

	return (
		<div className={styles["chat-model"]}>
			{showSwitch && (
				<>
					<span className={styles["chat-header-model"]}>模型: </span>
					<Switch
						checkedChildren={checkedChildrenText}
						unCheckedChildren={unCheckedChildrenText}
						checked={checked}
						onChange={handleSwitch}
						disabled={disabled}
					/>
				</>
			)}

			{modelType == "高级" && (
				<Tooltip title="高级模型消耗5积分/次">
					<InfoCircleOutlined
						style={{
							marginLeft: 5,
							color: "#0958d9",
						}}
					/>
				</Tooltip>
			)}

			{contextHolder}
		</div>
	);
}
