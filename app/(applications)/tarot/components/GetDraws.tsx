//  use modal to show the options to get more draws
import { useState, useEffect } from "react";
import styles from "../styles/QuestionInput.module.scss";

import { Modal, List, message } from "antd";
import { resetTarotBalance } from "@/app/api/backend/user";
import { useUserStore } from "@/app/store";
import { QRCode } from "antd/lib";
import { useRouter } from "next/navigation";

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
	const router = useRouter();

	const { user, updateUser } = userStore;
	const { invite_code } = user;

	const [buttonDisabled, setButtonDisabled] = useState(false);
	const [buttonText, setButtonText] = useState("立即领取");
	const [showQR, setShowQR] = useState(false);

	const baseUrl = new URL(window.location.href).origin;

	const inviteLink = `${baseUrl}/auth?i=${invite_code}`;

	const handleCopyLink = () => {
		navigator.clipboard.writeText(inviteLink);
	};

	const balanceUpdate = async () => {
		messageApi.loading("领取中");
		try {
			const balance = await resetTarotBalance(user.id);
			if (balance.data) {
				const tarot_balance = balance.data.balance;

				updateUser({
					...user,
					user_balance: {
						...user.user_balance,
						tarot_balance,
					},
				});
				messageApi.success({
					content: `领取成功, 您的占卜次数已经增加'${tarot_balance}次`,
				});
			} else {
				setButtonDisabled(true);
				setButtonText("已领取");
				messageApi.info({
					content: balance.message || balance.msg.detail,
				});
			}
		} catch (error) {
			//
			messageApi.info("出错了, 稍后再试吧");
		}
	};

	const [messageApi, contextHolder] = message.useMessage();

	const data = [
		{
			title: "普通用户每日获得1次占卜机会 ",
			actions: [
				{
					className: `tarotButtonPrimary small ${
						buttonDisabled ? "disabled" : ""
					}`,
					text: buttonText,
					onClick: async (index: number) => {
						await balanceUpdate();
					},
				},
			],
		},
		{
			title: "VIP用户每日额外获得5次占卜机会 ",
			actions: [
				{
					className: "tarotButtonPrimary small",
					text: "升级会员",
					onClick: () => {
						router.push("/profile#2");
					},
				},
				{
					className: `tarotButtonPrimary small ${
						buttonDisabled ? "disabled" : ""
					}`,
					text: buttonText,
					onClick: async (index: number) => {
						await balanceUpdate();
					},
				},
			],
		},
		{
			title: "分享您的专属二维码, 好友注册后获得5次占卜机会",
			actions: [
				{
					className: "tarotButtonPrimary small",
					text: "二维码",
					onClick: () => {
						setShowQR(true);
					},
				},
				{
					className: "tarotButtonPrimary small",
					text: "复制链接",
					onClick: (index: number) => {
						handleCopyLink();
						messageApi.info("链接已复制到剪贴板");
					},
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
			{contextHolder}
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
			<Modal
				open={showQR}
				onCancel={() => setShowQR(false)}
				centered
				footer={null}
				classNames={classNames}
				className={styles.getDrawsModal}
			>
				<div className="flex-container column">
					<QRCode
						errorLevel="H"
						value={inviteLink}
						color="#fff"
						icon="https://xiaoguang.fun/bot.png"
					/>
					<p>您的专属二维码</p>
				</div>
			</Modal>
		</Modal>
	);
};

export default GetMoreDrawsModal;
