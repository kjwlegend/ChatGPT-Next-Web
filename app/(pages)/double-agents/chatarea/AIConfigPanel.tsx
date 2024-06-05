"use client";
// src/components/ChatArea/AIConfigPanel.tsx
// src/components/ChatArea/AIConfigPanel.tsx
import React, { useRef } from "react";
import {
	Card,
	Button,
	Slider,
	Tooltip,
	Tag,
	Dropdown,
	Avatar,
	Checkbox,
} from "antd";
import { BotAvatar as MaskAvatar } from "@/app/components/emoji";
import useDoubleAgentStore, {
	DoubleAgentChatSession,
} from "@/app/store/doubleAgents";
import styles from "../double-agents.module.scss";

import { ChatMessage, ChatSession, Mask } from "@/app/types/";

import { useChatStore } from "@/app/store/chat";
import { useUserStore } from "@/app/store/user";
import { useMaskStore } from "@/app/store/mask";
import { MenuProps } from "antd/lib/menu";
import { use, useEffect, useState } from "react";
import { Modal } from "@/app/components/ui-lib";
import { MaskConfig } from "@/app/chats/mask-components";
import { useMobileScreen } from "@/app/utils";
import {
	PlusCircleFilled,
	PlusCircleOutlined,
	PlusCircleTwoTone,
	SettingOutlined,
	SwitcherOutlined,
	UserOutlined,
	ThunderboltTwoTone,
	ApiTwoTone,
} from "@ant-design/icons";
import Locale from "@/app/locales";
import { useMemo } from "react";
import { usePluginStore } from "@/app/store/plugin";

import { getLang, getISOLang } from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { useDoubleAgentChatContext } from "../doubleAgentContext";

interface AIConfigPanelProps {
	side: "left" | "right";
}

const useHasHydrated = (): boolean => {
	const [hasHydrated, setHasHydrated] = useState<boolean>(false);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	return hasHydrated;
};

const GenerateMenuItems = (
	currentConversationId: string,
	side: "left" | "right",
) => {
	const chatStore = useChatStore();
	const userStore = useUserStore();
	const maskStore = useMaskStore().getAll();
	const { conversations, setAIConfig, clearAIConfig } = useDoubleAgentStore();

	const handleMaskClick = (mask: any) => {
		// console.log(mask);
		setAIConfig(currentConversationId, side, mask);
	};

	const maskItems = Object.values(maskStore).reduce(
		(result, mask) => {
			const category = mask.category;
			const categoryItem = result.find((item) => item.label === category);

			if (categoryItem) {
				categoryItem.children.push({
					key: mask.id,
					label: mask.name,
					onClick: () => {
						handleMaskClick(mask);
					},
				});
			} else {
				result.push({
					key: category,
					label: category,
					children: [
						{
							key: mask.id,
							label: mask.name,
							onClick: () => {
								handleMaskClick(mask);
							},
						},
					],
				});
			}

			return result;
		},
		[] as {
			key: string;
			label: string;
			children: { key: string; label: string; onClick?: () => void }[];
		}[],
	);

	return [
		{
			key: "2",
			label: "新建其他助手",
			children: maskItems,
		},
	];
};

const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ side }) => {
	const {
		conversations,
		currentConversationId,
		setAIConfig,
		clearAIConfig,
		updateConversation,
	} = useDoubleAgentStore();
	// console.log("currentConversationId", currentConversationId);

	const availablePlugins = usePluginStore()
		.getAll()
		.filter((p) => getLang() === p.lang);

	const [showModal, setShowModal] = useState(false);
	const [sliderValue, setSliderValue] = useState(0);
	const items: MenuProps["items"] = GenerateMenuItems(
		currentConversationId,
		side,
	);
	const session = conversations.find(
		(c: DoubleAgentChatSession) => c.id === currentConversationId,
	);
	// 使用 useMemo 来缓存 conversations 中的 AI 配置
	const firstAIConfig = useMemo(() => {
		const session = conversations.find(
			(c: DoubleAgentChatSession) => c.id === currentConversationId,
		);
		return session?.firstAIConfig;
	}, [conversations, currentConversationId]);

	const secondAIConfig = useMemo(() => {
		const session = conversations.find(
			(c: DoubleAgentChatSession) => c.id === currentConversationId,
		);
		return session?.secondAIConfig;
	}, [conversations, currentConversationId]);

	// 初始化 aiConfig 在 useEffect 中
	useEffect(() => {
		let aiConfig = side === "left" ? firstAIConfig : secondAIConfig;
		if (!aiConfig) {
			return;
		}
		// 这里可以初始化 aiConfig 或者执行其他初始化操作
	}, [side, firstAIConfig, secondAIConfig]);

	const aiConfig = side === "left" ? firstAIConfig : secondAIConfig;
	if (!aiConfig) {
		return;
	}

	if (!conversations) {
		return;
	}

	if (!session) {
		return;
	}

	if (!aiConfig.plugins) {
		aiConfig.plugins = [];
	}

	const plugins: MenuProps["items"] = availablePlugins.map((p) => {
		return {
			key: p.name,
			label: (
				<Checkbox
					checked={
						aiConfig.plugins && aiConfig.plugins.includes(p.toolName ?? p.name)
					}
					onChange={(e) => {
						updatePlugins(e, p);
					}}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					{p.name}
				</Checkbox>
			),
		};
	});

	const updatePlugins = (e: any, p: any) => {
		const updateSession = {
			...session,
			[side === "left" ? "firstAIConfig" : "secondAIConfig"]: {
				...aiConfig,
				plugins: e.target.checked
					? aiConfig.plugins
						? [...aiConfig.plugins, p.toolName ?? p.name]
						: [p.toolName ?? p.name]
					: aiConfig.plugins?.filter(
							(plugin: any) => plugin !== p.toolName ?? p.name,
					  ),
			},
		};

		updateConversation(currentConversationId, updateSession);
	};

	const handleSliderChange = (value: number) => {
		setSliderValue(value);
	};

	const handleSLiderAfterChange = (
		value: number,
		field: keyof Mask["modelConfig"],
	) => {
		// 当滑动结束时，更新AI配置
		console.log(value, field);
		setAIConfig(currentConversationId, side, {
			...aiConfig,
			modelConfig: {
				...aiConfig.modelConfig,
				[field]: value,
			},
		});
	};

	const handleDeleteAI = () => {
		clearAIConfig(currentConversationId, side);
	};

	// 渲染Slider组件的函数
	const renderSlider = (
		title: string,
		field: keyof Mask["modelConfig"],
		value: number,
		step: number,
		max: number,
		tooltip: string,
	) => (
		<div className={styles.sliderContainer}>
			<Tooltip title={tooltip}>
				<p>{title}</p>
			</Tooltip>
			<Slider
				defaultValue={value}
				step={step}
				max={max}
				onChange={(newValue) => handleSliderChange(newValue)}
				onAfterChange={(newValue) => handleSLiderAfterChange(newValue, field)}
			/>
		</div>
	);
	// 使用一个顶层的Fragment(<>)包裹返回的JSX
	return (
		<>
			{!aiConfig.modelConfig ? (
				<Card className={styles.aiConfigCard}>
					<Avatar
						size={65}
						icon={<UserOutlined style={{ color: "darkgrey" }} />}
						style={{
							backgroundColor: "white",
							border: "1px dashed darkgrey",
						}}
					/>
					<h4>未配置AI</h4>
					<Dropdown menu={{ items }}>
						<a onClick={(e) => e.preventDefault()}>
							<Button icon={<PlusCircleOutlined />}>添加 Agent</Button>
						</a>
					</Dropdown>
				</Card>
			) : (
				<Card
					key={aiConfig.id}
					className={styles.aiConfigCard}
					actions={[
						<Button
							key={aiConfig.id + "setting"}
							onClick={() => {
								setShowModal(true);
							}}
							icon={<SettingOutlined />}
						>
							配置
						</Button>,
						<Button
							key={aiConfig.id + "delete"}
							danger
							onClick={handleDeleteAI}
							icon={<PlusCircleOutlined />}
						>
							删除
						</Button>,
						<Dropdown menu={{ items }} key={aiConfig.id + "replace"}>
							<a onClick={(e) => e.preventDefault()}>
								<Button icon={<SwitcherOutlined />}>替换</Button>
							</a>
						</Dropdown>,
					]}
				>
					<div className="flex-container column">
						<MaskAvatar mask={aiConfig} size={55} />
						<h3>{aiConfig.name}</h3>
					</div>
					<p>{aiConfig.description}</p>
					<Tag>模型: {aiConfig.modelConfig.model}</Tag>

					<Dropdown menu={{ items: plugins }}>
						<Button
							icon={
								aiConfig.plugins.length > 0 ? (
									<ThunderboltTwoTone />
								) : (
									<ApiTwoTone />
								)
							}
							onClick={(e) => e.preventDefault()}
						>
							{aiConfig.plugins.length > 0
								? Locale.Chat.InputActions.DisablePlugins
								: Locale.Chat.InputActions.EnablePlugins}
						</Button>
					</Dropdown>

					{renderSlider(
						"多样性（Temperature）",
						"temperature",
						aiConfig.modelConfig.temperature,
						0.01,
						1,
						"控制输出的随机性和多样性",
					)}
					{renderSlider(
						"概率阈值（Top P）",
						"top_p",
						aiConfig.modelConfig.top_p,
						0.01,
						1,
						"保留的概率阈值",
					)}
					{renderSlider(
						"新主题惩罚（Presence Penalty）",
						"presence_penalty",
						aiConfig.modelConfig.presence_penalty,
						0.01,
						1,
						"引入新主题的频率",
					)}
					{renderSlider(
						"重复主题惩罚（Frequency Penalty）",
						"frequency_penalty",
						aiConfig.modelConfig.frequency_penalty,
						0.01,
						1,
						"限制重复主题的频率",
					)}
				</Card>
			)}
			{showModal && (
				<div className="modal-mask">
					<Modal
						title="AI配置"
						// open={showModal}
						onClose={() => setShowModal(false)}
					>
						<MaskConfig
							mask={aiConfig}
							updateMask={(updater) => {
								const mask = { ...aiConfig };
								updater(mask);
								setAIConfig(currentConversationId, side, mask);
							}}
						/>
					</Modal>
				</div>
			)}
		</>
	);
};
export default AIConfigPanel;
