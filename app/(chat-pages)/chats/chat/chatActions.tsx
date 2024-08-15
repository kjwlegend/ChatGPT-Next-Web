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
import { useWorkflowStore } from "@/app/store/workflow";

export function LLMModelSwitch(props: { session?: ChatSession }) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const [messageApi, contextHolder] = message.useMessage();

	const { selectedId, updateWorkflowGroup } = useWorkflowStore();

	const session = props.session || chatStore.currentSession();
	const sessionId = session.id;

	const model = session.mask.modelConfig.model;
	const availableModels = config.models;

	const [modelType, setModelType] = useState<"基础" | "高级">("基础");
	const [cost, setCost] = useState(1);
	const [checked, setChecked] = useState(false);
	const [showSwitch, setShowSwitch] = useState(false);
	const [currentProvider, setCurrentProvider] = useState(
		availableModels[0].provider,
	);

	// 使用 ref 保存上一次的模型
	const prevModelRef = useRef(model) as any;

	useEffect(() => {
		// 找到当前激活的 provider 和 key
		const currentProviderModel = availableModels.find((providerModel) =>
			providerModel.models.some((m) => m.key === model),
		);

		if (currentProviderModel) {
			setCurrentProvider(currentProviderModel.provider);
		}

		// 根据模型类型设置选中状态、模型类型和成本
		const isPro = isProModel(model);
		setModelType(isPro ? "高级" : "基础");
		setCost(isPro ? 5 : 1);

		console.log("modelType", modelType, checked, cost);

		// 更新当前session的model为currentProvider的第一个模型
		const currentProviderModels = availableModels.find(
			(providerModel) => providerModel.provider === currentProvider,
		)?.models;

		if (currentProviderModels && currentProviderModels.length > 0) {
			setShowSwitch(currentProviderModels.length >= 2);
			if (
				props.session &&
				prevModelRef.current !== currentProviderModels[0].name
			) {
				handleUpdateSession(currentProviderModels[0].name);
				prevModelRef.current = currentProviderModels[0].name; // 更新 ref
			}
		}
	}, [model, availableModels]);

	const handleUpdateSession = (newModel: string) => {
		if (props.session) {
			const updates = {
				sessions: [
					{
						...props.session,
						mask: {
							...props.session.mask,
							modelConfig: {
								...props.session.mask.modelConfig,
								model: newModel as ModelType,
							},
						},
					},
				],
			};
			updateWorkflowGroup(selectedId, updates); // 假设 groupId 在 props.session 中可用
		} else {
			chatStore.updateSession(sessionId, (session) => {
				session.mask.modelConfig.model = newModel as ModelType;
				return session;
			});
		}
	};

	const handleModelChange = (model: string) => {
		console.log("model change", model);
		if (!model) return;

		const isPro = isProModel(model);
		const newCost = isPro ? 5 : 1;

		// 更新会话模型配置
		handleUpdateSession(model);

		messageApi.success(
			`已切换到${isPro ? "高级" : "基础"}模型，消耗${newCost}积分/次.`,
		);
	};

	const handleSwitch = async (checked: boolean) => {
		setChecked(checked);
		setCost(checked ? 5 : 1);

		const currentProviderModels = availableModels.find(
			(providerModel) => providerModel.provider === currentProvider,
		)?.models;

		const newModelKey = checked
			? currentProviderModels?.[1]?.name
			: currentProviderModels?.[0]?.name;

		if (newModelKey && prevModelRef.current !== newModelKey) {
			// 添加条件判断
			await handleModelChange(newModelKey);
			prevModelRef.current = newModelKey; // 更新 ref
		}
	};

	const items: MenuProps["items"] = availableModels.map((providerModel) => ({
		key: providerModel.provider,
		label: providerModel.provider,
		onClick: () => {
			setCurrentProvider(providerModel.provider);
			handleMenuClick(providerModel.models[0].key);
		},
	}));

	const handleMenuClick = (key: string) => {
		console.log(`click ${key}`);
		if (prevModelRef.current !== key) {
			// 添加条件判断
			handleUpdateSession(key);
			prevModelRef.current = key; // 更新 ref
		}
	};

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
						checkedChildren={
							availableModels.find((pm) => pm.provider === currentProvider)
								?.models[1]?.key ?? ""
						}
						unCheckedChildren={
							availableModels.find((pm) => pm.provider === currentProvider)
								?.models[0]?.key ?? ""
						}
						checked={checked}
						onChange={handleSwitch}
					/>
				</>
			)}

			{modelType === "高级" && (
				<Tooltip title="高级模型消耗5积分/次">
					<InfoCircleOutlined style={{ marginLeft: 5, color: "#0958d9" }} />
				</Tooltip>
			)}

			{contextHolder}
		</div>
	);
}
