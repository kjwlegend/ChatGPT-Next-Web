"use client";

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
import { sessionConfig } from "@/app/types/";

export function LLMModelSwitch(
	props: { session?: sessionConfig; isworkflow?: boolean } = {
		isworkflow: false,
	},
) {
	const config = useAppConfig();
	const chatStore = useChatStore.getState();
	const [messageApi, contextHolder] = message.useMessage();
	const { selectedId, updateWorkflowSession } = useWorkflowStore();
	const session = props.session || chatStore.currentSession();
	const sessionId = session.id;
	const model = session.mask.modelConfig.model ?? "gpt-4o-mini";
	const availableModels = config.models;
	const [modelType, setModelType] = useState<"基础" | "高级">("基础");
	const [cost, setCost] = useState(1);
	const [checked, setChecked] = useState(false);
	const [showSwitch, setShowSwitch] = useState(true);
	const [currentProvider, setCurrentProvider] = useState("");
	const prevModelRef = useRef(model);
	const isUpdatingRef = useRef(false);

	useEffect(() => {
		if (isUpdatingRef.current) return;

		const currentProviderModel = availableModels.find((providerModel) =>
			providerModel.models.some((m) => m.name === model),
		);

		if (currentProviderModel) {
			setCurrentProvider(currentProviderModel.provider);
			const isPro = isProModel(model);
			setModelType(isPro ? "高级" : "基础");
			setCost(isPro ? 5 : 1);
			setChecked(currentProviderModel.models[1]?.name === model);
			setShowSwitch(currentProviderModel.models.length >= 2);
		} else {
			const firstProviderModel = availableModels[0];
			setCurrentProvider(firstProviderModel.provider);
			handleUpdateSession(firstProviderModel.models[0].name).then(() => {
				prevModelRef.current = firstProviderModel.models[0].name as
					| "gpt-4o-mini"
					| "gpt-4o"
					| "deepseek-chat"
					| "deepseek-code";
				isUpdatingRef.current = false;
			});
		}
	}, [model, availableModels, props.session]);

	const handleUpdateSession = useCallback(
		async (newModel: string) => {
			try {
				if (props.isworkflow) {
					await updateWorkflowSession(selectedId, session.id, {
						mask: {
							...session.mask,
							modelConfig: {
								...session.mask.modelConfig,
								model: newModel as ModelType,
							},
						},
					});
				} else {
					chatStore.updateSession(sessionId, (session) => {
						session.mask.modelConfig.model = newModel as ModelType;
						return session;
					});
				}
			} catch (error) {
				messageApi.error("更新模型失败，请重试。");
			}
		},
		[
			props.isworkflow,
			selectedId,
			session.id,
			session.mask,
			chatStore,
			messageApi,
			updateWorkflowSession,
		],
	);

	const handleModelChange = useCallback(
		async (model?: string) => {
			if (!model) return;
			const isPro = isProModel(model);
			await handleUpdateSession(model);
			messageApi.success(
				`已切换到${isPro ? "高级" : "基础"}模型，消耗${isPro ? 5 : 1}积分/次.`,
			);
		},
		[handleUpdateSession, messageApi],
	);

	const handleSwitch = useCallback(
		async (checked: boolean) => {
			setChecked(checked);
			const currentProviderModels = availableModels.find(
				(providerModel) => providerModel.provider === currentProvider,
			)?.models;

			const newModelName = checked
				? currentProviderModels?.[1]?.name
				: currentProviderModels?.[0]?.name;

			if (newModelName && prevModelRef.current !== newModelName) {
				isUpdatingRef.current = true;
				await handleModelChange(newModelName);
				prevModelRef.current = newModelName as
					| "gpt-4o-mini"
					| "gpt-4o"
					| "deepseek-chat"
					| "deepseek-code";
				isUpdatingRef.current = false;
			}
		},
		[availableModels, currentProvider, handleModelChange],
	);

	const handleMenuClick = useCallback(
		async (name: string) => {
			if (prevModelRef.current !== name) {
				await handleUpdateSession(name);
				prevModelRef.current = name as
					| "gpt-4o-mini"
					| "gpt-4o"
					| "deepseek-chat"
					| "deepseek-code";
			}
		},
		[handleUpdateSession],
	);

	const items = useMemo(
		() =>
			availableModels.map((providerModel) => ({
				key: providerModel.provider,
				label: providerModel.provider,
				onClick: () => {
					setCurrentProvider(providerModel.provider);
					handleMenuClick(providerModel.models[0].name);
				},
			})),
		[availableModels, handleMenuClick],
	);

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
