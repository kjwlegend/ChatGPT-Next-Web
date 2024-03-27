//  use modal to show the options to get more draws
import { useState, useEffect } from "react";
import styles from "../styles/QuestionInput.module.scss";

import { Modal, List } from "antd";
import { resetTarotBalance } from "@/app/api/backend/user";
import { useUserStore } from "@/app/store";

interface GetMoreDrawsModalProps {
	visible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}
const classNames = {
	body: styles["draw-modal-body"],
	mask: styles["draw-modal-mask"],
	header: styles["draw-modal-header"],
	footer: styles["draw-modal-footer"],
	content: styles["draw-modal-content"],
	title: styles["draw-modal-title"],
};

const GetMoreDrawsModal: React.FC<GetMoreDrawsModalProps> = ({
	visible,
	onClose,
}) => {
	const userStore = useUserStore();

	const { user, updateUser } = userStore;

	const data = [
		{
			title: "普通用户每日获得1次占卜机会, 0点刷新 ",
			actions: [
				{
					className: "tarotButtonPrimary small",
					text: "立即领取",
					onClick: async () => {
						const balance = await resetTarotBalance(user.id);
						if (balance) {
							const tarot_balance = balance.data.balance;
							updateUser({ ...user, tarot_balance });
						}
					},
				},
			],
		},
		{
			title: "VIP用户每日额外获得5次占卜机会, 0点刷新 ",
			actions: [
				{
					className: "tarotButtonPrimary small",
					text: "升级会员",
					onClick: () => {},
				},
				{
					className: "tarotButtonPrimary small",
					text: "立即领取",
					onClick: () => {},
				},
			],
		},
		{
			title: "分享您的专属二维码, 好友注册后获得5次占卜机会",
			actions: [
				{
					className: "tarotButtonPrimary small",
					text: "分二维码",
					onClick: () => {},
				},
				{
					className: "tarotButtonPrimary small",
					text: "复制链接",
					onClick: () => {},
				},
			],
		},
	];

	return (
		<Modal
			title="获取更多占卜次数"
			open={visible}
			onCancel={onClose}
			centered
			footer={null}
			className={styles.getDrawsModal}
			classNames={classNames}
		>
			<List
				className={styles.drawList}
				itemLayout="horizontal"
				split={true}
				dataSource={data}
				renderItem={(item) => {
					// 分割类名字符串并映射到模块化CSS类名
					// 遍历actions数组，为每个action创建一个按钮
					const actionButtons = item.actions.map(
						(action: any, index: number) => {
							// 分割类名字符串并映射到模块化CSS类名
							const buttonClassNames = action.className
								.split(" ")
								.map((className: string) => styles[className] || className)
								.join(" ");

							return (
								<button
									key={index} // 确保每个按钮有一个唯一的key
									className={buttonClassNames}
									onClick={action.onClick}
								>
									{action.text}
								</button>
							);
						},
					);

					return <List.Item actions={actionButtons}>{item.title}</List.Item>;
				}}
			/>
		</Modal>
	);
};

export default GetMoreDrawsModal;
