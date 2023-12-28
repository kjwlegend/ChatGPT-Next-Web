import { Button } from "antd";
import { useChatStore } from "@/app/store";
import { ChatSession } from "@/app/store";

// 定义按钮位置的类型
// type ButtonPosition = "左上" | "右上" | "左下" | "右下";

// 创建按钮组件的函数，带有类型注解

const MjActions = (props: { session: ChatSession; taskid: string }) => {
	// 确保MjAction函数可以接收session作为参数
	const { session, taskid } = props;
	const chatStore = useChatStore();

	// 事件处理函数，接收按钮的位置
	const handleClick = (
		keyPrefix: string,
		index: number,
		session: ChatSession,
		taskid: string,
	) => {
		console.log(`Button ${keyPrefix}  clicked`);
		// 这里可以添加你的逻辑来处理点击事件
		console.log("Button index", index);

		// 构造参数
		const content = ""; // 根据需要设置合适的content值
		const image_url = ""; // 根据需要设置合适的image_url值
		const action = keyPrefix;
		const taskId = taskid;
		const newIndex = index + 1; // 更新index

		// 调用 midjourneyOnUserInput 函数，传递参数
		chatStore.midjourneyOnUserInput(
			content,
			image_url,
			session,
			action,
			taskId,
			newIndex,
		);
	};

	const MjAction = (
		label: string,
		keyPrefix: string,
		session: ChatSession,
		taskid: string,
	) => (
		<div key={keyPrefix}>
			<span style={{ marginRight: 8 }}>{label}</span>
			{(["左上", "右上", "左下", "右下"] as string[]).map((position, index) => (
				<Button
					size="small"
					key={`${keyPrefix}-${index}`} // 给每个按钮分配一个唯一的 key
					onClick={() => handleClick(keyPrefix, index, session, taskid)} // 点击时调用事件处理函数并传递位置
				>
					{position}
				</Button>
			))}
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
