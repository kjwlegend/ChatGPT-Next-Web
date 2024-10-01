import React, { useState } from "react";
import { Modal, Radio, message, Tooltip } from "antd";
import Image from "next/image";
import styles from "../products.module.scss";
import useAuth from "@/app/hooks/useAuth";
import { createOrder, processOrder } from "@/app/services/api/orders";
import { WechatOutlined, AlipayOutlined } from "@ant-design/icons";

import type { Product, Order } from "@/app/services/api/orders";

interface CheckoutModalProps {
	isVisible: boolean;
	onClose: () => void;
	product: Product;
	quantity: number;
	user: any; // Replace with proper user type
	isYearly?: boolean;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
	isVisible,
	onClose,
	product,
	quantity,
	user,
	isYearly,
}) => {
	const { updateUserInfo } = useAuth();
	const [paymentMethod, setPaymentMethod] = useState("1");
	const [messageApi, contextHolder] = message.useMessage();

	const handlePaymentMethodChange = (e: any) => {
		setPaymentMethod(e.target.value);
	};

	const getPaymentMethod = (paymentMethod: string) => {
		switch (paymentMethod) {
			case "1":
				return "virtual_currency";
			case "2":
				return "wechat";
			case "3":
				return "alipay";
			default:
				return "virtual_currency";
		}
	};

	const handleConfirmUpgrade = async () => {
		if (product.price === 0) {
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

			const selectedPaymentMethod = getPaymentMethod(paymentMethod);

			// 创建订单
			const createOrderResponse = await createOrder({
				product_key: product.productKey,
				quantity: quantity,
				payment_method: selectedPaymentMethod,
				currency: "CNY",
			});

			if (createOrderResponse.code === 201) {
				if (selectedPaymentMethod === "virtual_currency") {
					// 对于虚拟货币支付，直接处理结果
					handleOrderResult(createOrderResponse.order);
				} else {
					// 对于其他支付方式，需要进行额外的处理
					const processOrderResponse = await processOrder(
						{
							order_id: createOrderResponse.order.id,
						},
						createOrderResponse.order.id,
					);
					handleOrderResult(processOrderResponse.order);
				}
			} else {
				messageApi.open({
					key: "status",
					type: "error",
					content: `创建订单失败: ${createOrderResponse.message || createOrderResponse.error}`,
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

	const handleOrderResult = (order: Order) => {
		if (order.payment_status === "paid") {
			messageApi.open({
				key: "status",
				type: "success",
				content: `支付成功:  "订单已完成", 请刷新页面或者重新登录`,
				duration: 4,
			});
			updateUserInfo(user.id);
		} else {
			messageApi.open({
				key: "status",
				type: "error",
				content: `支付失败:  "订单处理失败"`,
				duration: 2,
			});
		}
	};

	return (
		<Modal
			title="确认购买"
			open={isVisible}
			onOk={handleConfirmUpgrade}
			onCancel={onClose}
			width={550}
			className={styles.checkoutModal}
			okText="确认支付"
			cancelText="取消"
		>
			{contextHolder}
			<div className={styles.modalContent}>
				<div className={styles.productInfo}>
					<h3 className={styles.productName}>{product.name}</h3>
					<p className={styles.productDescription}>{product.description}</p>
					<p className={styles.price}>价格: ¥{product.price}</p>
					{isYearly && (
						<p className={styles.yearlyDiscount}>年付优惠: 节省10%</p>
					)}
					<div className={styles.balanceInfo}>
						<p>当前余额：¥{user.virtual_currency}</p>
						<p>扣款金额：¥{product.price}</p>
						<p>剩余金额：¥{user.virtual_currency - product.price}</p>
					</div>
					<Radio.Group
						onChange={handlePaymentMethodChange}
						value={paymentMethod}
						className={styles.paymentMethod}
					>
						<Radio value="1">小光币</Radio>
						<Tooltip title="暂不可用">
							<Radio value="2" disabled>
								<WechatOutlined /> 微信
							</Radio>
						</Tooltip>
						<Tooltip title="暂不可用">
							<Radio value="3" disabled>
								<AlipayOutlined /> 支付宝
							</Radio>
						</Tooltip>
					</Radio.Group>
				</div>
			</div>
		</Modal>
	);
};

export default CheckoutModal;
