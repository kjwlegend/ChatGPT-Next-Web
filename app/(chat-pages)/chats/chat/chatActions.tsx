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

export function LLMModelSwitch(
	props: { session?: ChatSession; isworkflow?: boolean } = {
		isworkflow: false,
	},
) {
	const config = useAppConfig();
	const chatStore = useChatStore();
	const [messageApi, contextHolder] = message.useMessage();
	const { selectedId, updateWorkflowSession, getCurrentWorkflowGroup } =
		useWorkflowStore();
	const session = props.session || chatStore.currentSession();
	const sessionId = session.id;
	const model = session.mask.modelConfig.model;
	const availableModels = config.models;
	const [modelType, setModelType] = useState<"基础" | "高级">("基础");
	const [cost, setCost] = useState(1);
	const [checked, setChecked] = useState(false);
	const [showSwitch, setShowSwitch] = useState(true);
	const [currentProvider, setCurrentProvider] = useState("");
	const prevModelRef: any = useRef(model);
	const isUpdatingRef = useRef(false);

	useEffect(() => {
		if (isUpdatingRef.current) return;

		const currentProviderModel = availableModels.find((providerModel) =>
			providerModel.models.some((m) => m.name === model),
		);

		//  判定当前的model 是否等于 availableModels 中的 model 的第二项

		const isChecked = () => {
			console.log(
				"model",
				model,
				"availablemodel 2",
				currentProviderModel?.models[1]?.name,
			);
			return currentProviderModel?.models[1]?.name === model;
		};

		if (currentProviderModel) {
			setCurrentProvider(currentProviderModel.provider);
			const isPro = isProModel(model);
			setModelType(isPro ? "高级" : "基础");
			setCost(isPro ? 5 : 1);
			setChecked(isChecked);

			const currentProviderModels = currentProviderModel.models;
			setShowSwitch(currentProviderModels.length >= 2);
		} else {
			// 如果当前 model 不在 availableModels 中，显示第一个 available model
			const firstProviderModel = availableModels[0];
			setCurrentProvider(firstProviderModel.provider);
			const firstModel = firstProviderModel.models[0].name;
			handleUpdateSession(firstModel).then(() => {
				prevModelRef.current = firstModel;
				isUpdatingRef.current = false;
			});
		}
	}, [model, availableModels, props.session]);

	const handleUpdateSession = async (newModel: string) => {
		if (props.isworkflow) {
			updateWorkflowSession(selectedId, session.id, {
				mask: {
					...session.mask,
					modelConfig: {
						...session.mask.modelConfig,
						model: newModel as ModelType,
					},
				},
			});

			console.log("no session updated");
		} else {
			// 更新非工作流会话
			chatStore.updateSession(sessionId, (session) => {
				session.mask.modelConfig.model = newModel as ModelType;
				return session;
			});
		}
	};

	const handleModelChange = async (model?: string) => {
		if (!model) return;
		const isPro = isProModel(model);
		console.log("debug", model);
		await handleUpdateSession(model);
		messageApi.success(
			`已切换到${isPro ? "高级" : "基础"}模型，消耗${isPro ? 5 : 1}积分/次.`,
		);
	};

	const handleSwitch = async (checked: boolean) => {
		setChecked(checked);
		const currentProviderModels = availableModels.find(
			(providerModel) => providerModel.provider === currentProvider,
		)?.models;

		const newModelName = checked
			? currentProviderModels?.[1]?.name
			: currentProviderModels?.[0]?.name;

		console.log(
			"debug switch click",
			checked,
			prevModelRef.current,
			newModelName,
		);

		if (newModelName && prevModelRef.current !== newModelName) {
			isUpdatingRef.current = true;
			await handleModelChange(newModelName);
			prevModelRef.current = newModelName;
			isUpdatingRef.current = false;
		}
	};

	const items = availableModels.map((providerModel) => ({
		key: providerModel.provider,
		label: providerModel.provider,
		onClick: () => {
			setCurrentProvider(providerModel.provider);
			handleMenuClick(providerModel.models[0].name);
		},
	}));

	const handleMenuClick = async (name: string) => {
		if (prevModelRef.current !== name) {
			await handleUpdateSession(name);
			prevModelRef.current = name;
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
