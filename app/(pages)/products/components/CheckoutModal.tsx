import React, { useState } from "react";
import { Modal, Radio, message } from "antd";
import Image from "next/image";
import styles from "../products.module.scss";
import { upgradeMember } from "@/app/api/backend/user";
import useAuth from "@/app/hooks/useAuth";

interface Product {
	name: string;
	price: number;
	description: string;
	productType: string;
	quantity?: number;
	membershipType?: string;
}

interface CheckoutModalProps {
	isVisible: boolean;
	onClose: () => void;
	product: Product;
	user: any; // Replace with proper user type
	isYearly?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
	isVisible,
	onClose,
	product,
	user,
	isYearly,
}) => {
	const { updateUserInfo } = useAuth();
	const [paymentMethod, setPaymentMethod] = useState("1");
	const [messageApi, contextHolder] = message.useMessage();

	const handlePaymentMethodChange = (e: any) => {
		setPaymentMethod(e.target.value);
	};

	const handleConfirmUpgrade = async () => {
		if (product.membershipType === "free") {
			messageApi.open({
				key: "status",
				type: "error",
				content: `免费会员无需购买`,
				duration: 2,
			});
			return;
		}
		try {
			messageApi.open({
				key: "status",
				type: "loading",
				content: `系统正在处理您的支付请求...`,
			});
			const response = await upgradeMember({
				user_id: user.id,
				membership_level: product.membershipType,
				order_amount: product.price,
				payment_type: paymentMethod,
			});

			if (response.code === 201) {
				messageApi.open({
					key: "status",
					type: "success",
					content: `支付成功: ${response.message}, 请刷新页面或者重新登录`,
					duration: 4,
				});
				updateUserInfo(user.id);
			} else {
				const message = response.message || response.msg;
				messageApi.open({
					key: "status",
					type: "error",
					content: `支付失败: ${message}`,
					duration: 2,
				});
			}
		} catch (error) {
			messageApi.open({
				key: "status",
				type: "error",
				content: `支付失败, 联系管理员: ${error}`,
				duration: 2,
			});
		}

		onClose();
	};

	return (
		<Modal
			title="确认购买"
			open={isVisible}
			onOk={handleConfirmUpgrade}
			onCancel={onClose}
			width={550}
			className={styles.checkoutModal}
			okText="确认"
			cancelText="取消"
		>
			{contextHolder}
			<div className={styles.modalContent}>
				<Image
					width={122}
					height={244}
					src="/ai-full.png"
					alt="小光"
					className={styles.paymentImage}
				/>
				<div>
					<p className={styles.service}>购买的服务：{product.name}</p>
					<p className={styles.description}>{product.description}</p>
					<p className={styles.balance}>当前余额：{user.virtual_currency}</p>
					<p className={styles.deduction}>扣款金额：{product.price}</p>
					<p className={styles.remaining}>
						剩余金额：{user.virtual_currency - product.price}
					</p>
					<Radio.Group
						onChange={handlePaymentMethodChange}
						value={paymentMethod}
						className={styles.paymentMethod}
					>
						<Radio value="1">小光币</Radio>
						<Radio value="2" disabled>
							微信
						</Radio>
						<Radio value="3" disabled>
							支付宝
						</Radio>
					</Radio.Group>
				</div>
			</div>
		</Modal>
	);
};

export default CheckoutModal;
