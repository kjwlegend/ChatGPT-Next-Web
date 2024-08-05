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

import { message, Switch, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";

import styles from "./chats.module.scss";
import { isProModel } from "@/app/utils";

// an antd switch component that can be used to toggle to switch chat LLM model

export function LLMModelSwitch(props: { session: ChatSession }) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const [messageApi, contextHolder] = message.useMessage();

	const session = props.session ? props.session : chatStore.currentSession();
	const sessionId = session.id;

	const model = session.mask.modelConfig.model;
	const availableModels = config.models;

	const [modelType, setModelType] = useState<"基础" | "高级">("基础");
	const [cost, setCost] = useState(1);
	const [checked, setChecked] = useState(false);
	const [showSwitch, setShowSwitch] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [currentProvider, setCurrentProvider] = useState(
		availableModels[0].provider,
	);

	useEffect(() => {
		// 找到当前激活的 provider 和 key
		const currentProviderModel = availableModels.find((providerModel) =>
			providerModel.models.some((m) => m.key === model),
		);
		if (currentProviderModel) {
			setCurrentProvider(currentProviderModel.provider);
		}
	}, [model, availableModels]);

	const handleModelChange = (model: string) => {
		console.log("model change", model);
		if (!model) return;
		// 设置模型类型和成本
		const isPro = isProModel(model);
		const modelType = isPro ? "高级" : "基础";
		const cost = isPro ? 5 : 1;

		// 更新会话模型配置
		chatStore.updateSession(sessionId, (session) => {
			session.mask.modelConfig.model = model as ModelType;
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
		const currentProviderModels = availableModels.find(
			(providerModel) => providerModel.provider === currentProvider,
		)?.models;
		const newModel = checked
			? currentProviderModels?.[1]?.name
			: currentProviderModels?.[0]?.name;
		if (newModel) {
			await handleModelChange(newModel);
		}
	};

	useEffect(() => {
		const isPro = isProModel(model);

		// 根据模型类型设置选中状态、模型类型和成本
		const modelType = isPro ? "高级" : "基础";
		const cost = isPro ? 5 : 1;
		setModelType(modelType);
		setCost(cost);

		// 打印当前模型类型、选中状态和成本
		console.log("modelType", modelType, checked, cost);
	}, [model]);

	const items: MenuProps["items"] = availableModels.map((providerModel) => ({
		key: providerModel.provider,
		label: providerModel.provider,
		onClick: (item) => {
			setCurrentProvider(providerModel.provider);
			const firstModelKey = providerModel.models[0].key;
			handelMenuClick(firstModelKey);
		},
	}));

	const handelMenuClick = (key: string) => {
		console.log(`click ${key}`);
		chatStore.updateSession(sessionId, (session) => {
			session.mask.modelConfig.model = key as ModelType;
			return session;
		});
	};

	const currentProviderModels = availableModels.find(
		(providerModel) => providerModel.provider === currentProvider,
	)?.models;
	const unCheckedChildrenText = currentProviderModels?.[0]?.key ?? "";
	const checkedChildrenText = currentProviderModels?.[1]?.key ?? "";

	useEffect(() => {
		// 如果模型数量小于2，不显示开关

		if (!currentProviderModels) return;
		setShowSwitch(currentProviderModels && currentProviderModels.length >= 2);
		// 更新当前session的model为currentProvider的第一个模型
		if (currentProviderModels && currentProviderModels.length > 0) {
			const firstModelKey = currentProviderModels[0].name;
			chatStore.updateSession(sessionId, (session) => {
				session.mask.modelConfig.model = firstModelKey as ModelType;
				return session;
			});
		}
	}, [currentProvider, availableModels]);

	return (
		<div className={styles["chat-model"]}>
			{showSwitch && (
				<>
					<Dropdown menu={{ items }} arrow={true}>
						<span
							className={styles["chat-header-model"]}
							style={{ fontSize: 12, cursor: "pointer" }}
						>
							{currentProvider}
							<DownOutlined style={{ margin: "0 3px" }} />
						</span>
					</Dropdown>
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
