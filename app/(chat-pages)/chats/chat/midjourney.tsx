import { useChatStore } from "@/app/store/chat/index";

import { ChatMessage, ChatSession } from "@/app/types/chat";

import { useState, useEffect, HtmlHTMLAttributes } from "react";
import styles from "./chats.module.scss";
import { midjourneyOnUserInput } from "@/app/services/midjourneyService";

import { Slider, Radio, Input, Form, Button, Drawer, Typography } from "antd";
import type { RadioChangeEvent } from "antd";
import { FloatButton } from "antd";
import {
	QuestionCircleFilled,
	QuestionCircleTwoTone,
	UnorderedListOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
// 定义按钮位置的类型
// type ButtonPosition = "左上" | "右上" | "左下" | "右下";

// 创建按钮组件的函数，带有类型注解

export const MjActions = (props: { session: ChatSession; taskid: string }) => {
	// 确保MjAction函数可以接收session作为参数
	const { session, taskid } = props;

	const [loadings, setLoadings] = useState<Record<string, boolean>>({});

	// 事件处理函数，接收按钮的位置
	const handleClick = async (
		keyPrefix: string,
		index: number,
		session: ChatSession,
		taskid: string,
	) => {
		console.log(`Button ${keyPrefix}  clicked`);
		// 这里可以添加你的逻辑来处理点击事件
		console.log("Button index", index);

		const buttonKey = `${keyPrefix}-${index}`;
		setLoadings((prevLoadings) => ({
			...prevLoadings,
			[buttonKey]: true,
		}));

		// 构造参数
		const content = ""; // 根据需要设置合适的content值
		const image_url = ""; // 根据需要设置合适的image_url值
		const action = keyPrefix;
		const taskId = taskid;
		const newIndex = index + 1; // 更新index

		// 调用 midjourneyOnUserInput 函数，传递参数
		const params = {
			content: content,
			image_url: image_url,
			_session: session,
			action: action,
			taskId: taskId,
			index: newIndex,
		};
		await midjourneyOnUserInput(params);
		setLoadings((prevLoadings) => ({
			...prevLoadings,
			[buttonKey]: false,
		}));
	};

	const MjAction = (
		label: string,
		keyPrefix: string,
		session: ChatSession,
		taskid: string,
	) => (
		<div key={keyPrefix}>
			<span style={{ marginRight: 5, fontSize: 13, color: "rgb(187 84 249)" }}>
				{label}
			</span>
			{(["左上", "右上", "左下", "右下"] as string[]).map((position, index) => {
				const buttonKey = `${keyPrefix}-${index}`;
				return (
					<Button
						size="small"
						key={buttonKey}
						loading={loadings[buttonKey]}
						className={styles["mj-action-button"]}
						onClick={() => handleClick(keyPrefix, index, session, taskid)}
					>
						{position}
					</Button>
				);
			})}
		</div>
	);

	return (
		<div>
			{MjAction("放大", "UPSCALE", session, taskid)}
			{MjAction("变换", "VARIATION", session, taskid)}
		</div>
	);
};

export const MJFloatButton = () => {
	const [mjPanelVisible, setMJPanelVisible] = useState(false);

	const handleFloatButtonClick = () => {
		setMJPanelVisible(!mjPanelVisible);
	};

	return (
		<div>
			<FloatButton
				rootClassName={styles["mj-float-button"]}
				shape="circle"
				type="primary"
				icon={<UnorderedListOutlined />}
				tooltip="画图设置"
				onClick={handleFloatButtonClick}
			/>
			{<MJPanel open={mjPanelVisible} />}
		</div>
	);
};

export const MJPanel = ({ open }: { open: boolean }) => {
	const [visible, setVisible] = useState(false);
	const [size, setSize] = useState("1:1");
	const [customSize, setCustomSize] = useState("");

	const isCustom = size === "自定义";
	const [stylizeValue, setStylizeValue] = useState(500);
	const [model, setModel] = useState("v6");
	const [seed, setSeed] = useState("");
	const chatStore = useChatStore.getState();

	useEffect(() => {
		setVisible(open);
	}, [open]);

	const onClose = () => {
		updateSessionConfig();
		setVisible(false);
	};

	const handleSizeChange = (e: any) => {
		setSize(e.target.value);
		if (e.target.value !== "自定义") {
			setCustomSize("");
		}
	};

	const handleCustomSizeChange = (e: any) => {
		setCustomSize(e.target.value);
	};
	const handleStylizeChange = (value: number) => {
		setStylizeValue(value);
		const stylizeConfig = `--stylize ${value}`;
	};

	const handleModelChange = (e: any) => {
		const newModel = e.target.value;
		setModel(newModel);
		const modelConfig =
			newModel === "漫画" ? "--niji" : `--v ${newModel.replace("v", "")}`;
	};

	const handleSeedChange = (e: any) => {
		const newSeed = e.target.value;
		setSeed(newSeed);
	};

	const updateSessionConfig = () => {
		const newsize = isCustom ? customSize : size;
		const sizeConfig = "--ar " + newsize;
		const stylizeConfig = `--stylize ${stylizeValue}`;
		const modelConfig =
			model === "漫画" ? "--niji" : `--v ${model.replace("v", "")}`;

		console.log("sizeConfig", sizeConfig);
		console.log("stylizeConfig", stylizeConfig);
		console.log("modelConfig", modelConfig);
		console.log("seed", seed);

		// chatStore.updateSession(session.id, () => {
		// 	session.mjConfig.size = sizeConfig;
		// 	session.mjConfig.stylize = stylizeConfig;
		// 	session.mjConfig.model = modelConfig;
		// 	if (seed) {
		// 		session.mjConfig.seed = seed;
		// 	}
		// });
	};

	return (
		<Drawer
			title="绘图设置"
			placement="right"
			closable={false}
			onClose={onClose}
			open={visible}
			extra={<Button onClick={onClose}>保存</Button>}
			// mask={false}
		>
			<Form>
				<Form.Item label="绘图尺寸">
					<div className="aspect-ratio-form">
						<Radio.Group onChange={handleSizeChange} value={size}>
							<Radio value="1:1">1:1</Radio>
							<Radio value="4:3">4:3</Radio>
							<Radio value="3:4">3:4</Radio>
							<Radio value="3:2">3:2</Radio>
							<Radio value="2:3">2:3</Radio>
							<Radio value="16:9">16:9</Radio>
							<Radio value="9:16">9:16</Radio>
							<Radio value="自定义">自定义</Radio>
						</Radio.Group>
						{isCustom && (
							<Input
								className="custom-size-input"
								value={customSize}
								onChange={handleCustomSizeChange}
								placeholder="请输入比例，例如 2:3"
							/>
						)}
					</div>
				</Form.Item>
				<Form.Item label="风格化程度" tooltip="数值越低越真实, 越高越有创意">
					<Slider
						min={0}
						max={1000}
						step={50}
						onChange={handleStylizeChange}
						value={stylizeValue}
					/>
				</Form.Item>
				<Form.Item
					label="模型选择"
					tooltip="v6 为最新模型,写实度更高, v5.2 为旧版模型, niji为漫画模型"
				>
					<Radio.Group onChange={handleModelChange} value={model}>
						<Radio value="v6">v6</Radio>
						<Radio value="v5.2">v5.2</Radio>
						<Radio value="漫画">niji</Radio>
					</Radio.Group>
				</Form.Item>
				<Form.Item
					label="Seed 值"
					tooltip="seed值包含一张图片的主体核心要素, 可保持主体不变生成其他版本"
				>
					<Input type="text" value={seed} onChange={handleSeedChange} />
				</Form.Item>
			</Form>
		</Drawer>
	);
};
export default MjActions;
