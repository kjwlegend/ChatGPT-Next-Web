import { Button } from "antd";
import { useChatStore } from "@/app/store";
import { ChatSession } from "@/app/store";
import { useState } from "react";
import styles from "./chats.module.scss";

// 定义按钮位置的类型
// type ButtonPosition = "左上" | "右上" | "左下" | "右下";

// 创建按钮组件的函数，带有类型注解

const MjActions = (props: { session: ChatSession; taskid: string }) => {
	// 确保MjAction函数可以接收session作为参数
	const { session, taskid } = props;
	const chatStore = useChatStore();

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
		await chatStore.midjourneyOnUserInput(
			content,
			image_url,
			session,
			action,
			taskId,
			newIndex,
		);
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

export default MjActions;
