"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/user";
import styles from "./profile.module.scss";
import CountUp from "react-countup";

import { Col, Divider, Row, Statistic, message } from "antd";
import { Modal, Button, Radio } from "antd"; // 引入 Modal 和 Button 组件
import { Typography } from "antd";
import { SmileTwoTone } from "@ant-design/icons";
import { QRCode } from "antd";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";
import { member_type, upgradeMember } from "../api/backend/user";
import { type } from "os";
import Image from "next/image";
import { epaySigniture } from "../services/ePayService";

const { Paragraph } = Typography;

interface CardData {
	description: string;
	value: string;
}

interface CardComponentProps {
	title: string;
	data: CardData[];
	price: string;
	isCurrentPackage: boolean;
	onUpgrade: () => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
	title,
	data,
	price,
	isCurrentPackage,
	onUpgrade,
}) => {
	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<h3>{title}</h3>
				<button
					className={
						isCurrentPackage ? styles.currentButton : styles.upgradeButton
					}
					onClick={onUpgrade}
				>
					{isCurrentPackage ? "当前" : "升级"}
				</button>
			</div>
			<p className={styles.price}>{price}</p>

			{data.map((item, index) => (
				<div key={index} className={styles.row}>
					<p className={styles.description}>{item.description}</p>
					<p className={styles.value}>{item.value}</p>
				</div>
			))}
		</div>
	);
};

const MembershipTab = () => {
	const { user } = useUserStore();
	const { updateUserInfo } = useAuth();

	const [messageApi, contextHolder] = message.useMessage();
	// 添加状态变量
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMembershipType, setSelectedMembershipType] = useState(
		"normal" as member_type,
	);
	const [paymentMethod, setPaymentMethod] = useState("1"); // 默认选择小光币

	// 我需要基于selectedMembershipType 生成对应的中文 selectedMembershipName,
	const [selectedMembershipName, setSelectedMembershipName] =
		useState("普通会员");
	useEffect(() => {
		switch (selectedMembershipType) {
			case "normal":
				setSelectedMembershipName("普通会员");
				break;
			case "monthly":
				setSelectedMembershipName("黄金会员");
				break;
			case "quarterly":
				setSelectedMembershipName("白金会员");
				break;
			case "halfyearly":
				setSelectedMembershipName("钻石会员");
				break;
			default:
				setSelectedMembershipName("普通会员");
		}
	}, [selectedMembershipType]);

	const {
		member_type,
		user_balance,
		member_expire_date,
		last_refresh_date,
		id,
	} = user;

	const { xgb_balance, chat_balance, draw_balance } = user_balance;

	// 定义4种会员的价格
	const [price, setPrice] = useState({
		normal: 0,
		monthly: 20,
		quarterly: 55,
		halfyearly: 98,
	});

	console.log("sign", epaySigniture);

	useEffect(() => {
		// 在这里可以根据需要加载邀请人数和邀请点数的数据
		updateUserInfo(id);
	}, [id]);

	const currentPackage = (packageType: string) => {
		return member_type === packageType;
	};
	const handleUpgrade = (memberType: member_type) => {
		// 更新状态变量
		setIsModalVisible(true);
		setSelectedMembershipType(memberType);
	};

	// 添加一个函数来关闭模态框
	const handleModalClose = () => {
		setIsModalVisible(false);
	};

	// 添加一个函数来确认升级
	const handleConfirmUpgrade = async () => {
		// 在这里添加升级的逻辑
		if (selectedMembershipType == "normal") {
			messageApi.open({
				key: "status",
				type: "error",
				content: `普通会员无需购买`,
				duration: 2,
			});
			return;
		}
		try {
			// Get the selected membership type

			messageApi.open({
				key: "status",
				type: "loading",
				content: `系统正在处理您的支付请求...`,
			});
			// Call the backend API to upgrade the member
			const response = await upgradeMember({
				user_id: user.id,
				member_type: selectedMembershipType,
				order_amount: getPrice(selectedMembershipType),
				payment_type: paymentMethod,
			});

			// Check the response code
			if (response.code === 201) {
				messageApi.open({
					key: "status",
					type: "success",
					content: `支付成功: ${response.message}, 请刷新页面或者重新登录`,
					duration: 4,
				});
				// Call the function to update user information
				updateUserInfo(id);
			} else {
				console.log(response);
				//  check both response.message and response.msg

				const message = response.message || response.msg;

				messageApi.open({
					key: "status",
					type: "error",
					content: `支付失败: ${message}`,
					duration: 2,
				});
			}
		} catch (error) {
			// Handle payment failure
			messageApi.open({
				key: "status",
				type: "error",
				content: `支付失败, 联系管理员: ${error}`,
				duration: 2,
			});
		}

		// 关闭模态框
		setIsModalVisible(false);
	};

	// 添加一个函数来处理支付方式的改变
	const handlePaymentMethodChange = (e: any) => {
		setPaymentMethod(e.target.value);
	};

	// Function to get the price based on the selected membership type
	const getPrice = (membershipType: member_type) => {
		// Implement logic to get the price based on the membership type
		// You can use the 'price' state to get the prices for different membership types
		// Replace this with your actual logic to get the price
		switch (membershipType) {
			case "normal":
				return price.normal;
			case "monthly":
				return price.monthly;
			case "quarterly":
				return price.quarterly;
			case "halfyearly":
				return price.halfyearly;
			default:
				return 0;
		}
	};

	// Function to show the confirmation dialog
	const showConfirmationDialog = (purchaseDetails: any) => {
		// Implement the logic to show the confirmation dialog with the purchase details
		// You can use a modal or any other UI component to display the details and handle user interaction
		// Once the user confirms the payment, proceed with the next steps
	};

	const baseUrl = new URL(window.location.href).origin;

	return (
		<div>
			{contextHolder}
			{/* 添加 Modal 组件 */}
			{/* 添加 Modal 组件 */}
			<Modal
				title="确认升级"
				open={isModalVisible}
				onOk={handleConfirmUpgrade}
				onCancel={handleModalClose}
				width={550} // 增加宽度以适应左右分栏设计
				className={styles["payment-modal-container"]}
				okText="确认"
				cancelText="取消"
			>
				<div className={styles["modal-content-container"]}>
					<Image // 添加 Image 组件
						width={122} // 设置图片宽度
						height={244}
						src="/ai-full.png" // 设置图片源
						alt="小光" // 设置图片描述
						className={styles["payment-image"]}
					/>
					<div>
						<p className={styles["service"]}>
							购买的服务：{selectedMembershipName}
						</p>
						<p className={styles["balance"]}>当前余额：{xgb_balance}</p>
						<p className={styles["deduction"]}>
							扣款金额：{getPrice(selectedMembershipType)}
						</p>
						<p className={styles["remaining"]}>
							剩余金额：{xgb_balance - getPrice(selectedMembershipType)}
						</p>
						<Radio.Group
							onChange={handlePaymentMethodChange}
							value={paymentMethod}
							className={styles["payment-method"]}
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

			<Row justify="center" gutter={16} style={{ textAlign: "center" }}>
				<Col xs={12} sm={4}>
					<Statistic title="会员类型" value={member_type} />
				</Col>
				<Col xs={12} sm={4}>
					<Statistic title="会员到期时间" value={member_expire_date} />
				</Col>
				{/* xgb */}
				<Col xs={12} sm={4}>
					<Statistic title="小光币" value={xgb_balance || ""} />
				</Col>
				<Col xs={12} sm={4}>
					<Statistic
						title="剩余对话次数"
						value={chat_balance || ""}
						groupSeparator=""
					/>
				</Col>
				{/* <Col xs={12} sm={4}>
					<Statistic
						title="剩余绘画支持"
						value={draw_balance || ""}
						groupSeparator=""
					/>
				</Col> */}
				<Col xs={12} sm={4}>
					<Statistic
						title="对话重置时间"
						value={last_refresh_date || ""}
						groupSeparator=""
					/>
				</Col>
			</Row>
			<Divider />
			{/* 生成一个标准的 3种类型的会员介绍 卡片*/}
			<div className={styles.cardcontainer}>
				<CardComponent
					title="普通会员"
					price="免费"
					data={[
						{ description: "对话次数", value: "200 次/月" },
						{ description: "最大token支持", value: "4000" },
						{ description: "模型支持", value: "小光3.5, 4.0" },
						{ description: "上下文长度", value: "16k" },
						{ description: "联网搜索", value: "是" },
						{ description: "绘画支持", value: "否" },
						{ description: "本地知识库", value: "是" },
					]}
					isCurrentPackage={currentPackage("普通会员")}
					onUpgrade={() => handleUpgrade("normal")}
				/>
				<CardComponent
					title="黄金会员(1个月)"
					price="￥20"
					data={[
						{ description: "对话次数", value: "1000次/月" },
						{ description: "最大token支持", value: "6000" },
						{ description: "模型支持", value: "小光3.5, 4.0" },
						{ description: "上下文长度", value: "16k" },
						{ description: "联网搜索", value: "是" },
						{ description: "绘画支持", value: "Dalle-3" },
						{ description: "本地知识库", value: "是" },
					]}
					isCurrentPackage={currentPackage("黄金会员")}
					onUpgrade={() => handleUpgrade("monthly")}
				/>
				<CardComponent
					title="白金会员(3个月)"
					price="￥55(9折)"
					data={[
						{ description: "对话次数", value: "1500次/月" },
						{ description: "最大token支持", value: "8000" },
						{ description: "模型支持", value: "小光3.5, 4.0" },
						{ description: "上下文长度", value: "16k" },
						{ description: "联网搜索", value: "是" },
						{ description: "绘画支持", value: "Dalle-3, MJ" },
						{ description: "本地知识库", value: "是" },
						{ description: "特殊功能支持", value: "工作流" },
					]}
					isCurrentPackage={currentPackage("白金会员")}
					onUpgrade={() => handleUpgrade("quarterly")}
				/>
				<CardComponent
					title="钻石会员(6个月)"
					price="￥98(8折)"
					data={[
						{ description: "对话次数", value: "2000次/月" },
						{ description: "最大token支持", value: "10000" },
						{
							description: "模型支持",
							value: "小光3.5, 4.0",
						},
						{ description: "上下文长度", value: "16k,32k" },
						{ description: "联网搜索", value: "是" },
						{ description: "绘画支持", value: "Dalle-3, MJ" },
						{ description: "本地知识库", value: "是" },
						{ description: "特殊功能支持", value: "工作流" },
					]}
					isCurrentPackage={currentPackage("钻石会员")}
					onUpgrade={() => handleUpgrade("halfyearly")}
				/>
			</div>
		</div>
	);
};

export default MembershipTab;
