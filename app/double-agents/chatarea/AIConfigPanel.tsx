"use client";
// src/components/ChatArea/AIConfigPanel.tsx
// src/components/ChatArea/AIConfigPanel.tsx
import React from "react";
import { Card, Button, Slider, Tooltip, Tag, Dropdown } from "antd";
import { Avatar } from "@/app/chats/emoji";
import useDoubleAgentStore from "@/app/store/doubleAgents";
import styles from "../double-agents.module.scss";
import { Mask } from "@/app/store/mask";
import { ChatSession } from "@/app/store/chat";
import { useChatStore } from "@/app/store/chat";
import { useUserStore } from "@/app/store/user";
import { useMaskStore } from "@/app/store/mask";
import { MenuProps } from "antd/lib/menu";
import { use, useEffect, useState } from "react";
import { Modal } from "@/app/components/ui-lib";
import { MaskConfig } from "@/app/chats/mask-components";

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
	} = useDoubleAgentStore();
	// console.log("currentConversationId", currentConversationId);

	const [showModal, setShowModal] = useState(false);
	const [sliderValue, setSliderValue] = useState(0);
	const items: MenuProps["items"] = GenerateMenuItems(
		currentConversationId,
		side,
	);

	useEffect(() => {
		// 这里可以做一些初始化的工作
	}, []);

	let firstAIConfig = conversations.find((c) => c.id === currentConversationId)
		?.firstAIConfig;
	let secondAIConfig = conversations.find((c) => c.id === currentConversationId)
		?.secondAIConfig;

	const aiConfig = side === "left" ? firstAIConfig : secondAIConfig;

	if (!aiConfig) {
		return null;
	}

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
					<Dropdown menu={{ items }}>
						<a onClick={(e) => e.preventDefault()}>
							<Button type="primary">添加 Agent</Button>
						</a>
					</Dropdown>
				</Card>
			) : (
				<Card className={styles.aiConfigCard}>
					<div className="flex-container">
						<Avatar model={aiConfig} />
						<h3>{aiConfig.name}</h3>
					</div>
					<p>{aiConfig.description}</p>
					<Tag>模型: {aiConfig.modelConfig.model}</Tag>
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
					<Button
						type="primary"
						onClick={() => {
							setShowModal(true);
						}}
					>
						配置修改
					</Button>
					<Dropdown menu={{ items }}>
						<a onClick={(e) => e.preventDefault()}>
							<Button>选择AI</Button>
						</a>
					</Dropdown>
					<Button danger onClick={handleDeleteAI}>
						删除AI
					</Button>
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
