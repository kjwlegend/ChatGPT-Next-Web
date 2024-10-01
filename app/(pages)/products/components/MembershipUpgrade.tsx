"use client";
import React, { useState, useEffect } from "react";
import styles from "../products.module.scss";
import { useUserStore } from "@/app/store/user";
import { membership_level } from "@/app/api/backend/user";
import { Switch, message } from "antd";
import CardComponent from "./CardComponent";
import CheckoutModal from "./CheckoutModal";

const MembershipUpgrade = () => {
	const { user } = useUserStore();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMembershipType, setSelectedMembershipType] =
		useState<membership_level>("free");
	const [isYearly, setIsYearly] = useState(false);
	const [productKey, setProductKey] = useState("");

	const currentPackage = (packageType: string) => {
		return user.membership_level === packageType;
	};

	const handleUpgrade = (memberType: membership_level) => {
		setIsModalVisible(true);
		setSelectedMembershipType(memberType);
	};

	const getPrice = (membershipType: membership_level, isYearly: boolean) => {
		const monthlyPrice = {
			free: 0,
			gold: 20,
			diamond: 50,
		}[membershipType];

		if (isYearly) {
			const yearlyPrice = monthlyPrice * 12;
			const discountedPrice = Math.floor(yearlyPrice * 0.9);
			return { original: yearlyPrice, discounted: discountedPrice };
		}

		return { original: monthlyPrice, discounted: monthlyPrice };
	};

	const formatPrice = (price: number, isYearly: boolean) => {
		return `￥${price}${isYearly ? "/年" : "/月"}`;
	};

	return (
		<div className={styles.membershipUpgrade}>
			<CheckoutModal
				isVisible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
				product={{
					productKey: productKey,
					name: selectedMembershipType === "gold" ? "黄金会员" : "钻石会员",
					price: getPrice(selectedMembershipType, isYearly).discounted,
					description: `${isYearly ? "年费" : "月费"}会员升级`,
					productType: "membership",
				}}
				quantity={isYearly ? 12 : 1}
				user={user}
				isYearly={isYearly}
			/>
			<h2>会员购买</h2>

			<div className={styles.switchContainer}>
				<span>月付</span>
				<Switch
					checked={isYearly}
					onChange={(checked) => setIsYearly(checked)}
				/>
				<span>年付（9折）</span>
			</div>

			<div className={styles.cardcontainer}>
				<CardComponent
					title="免费会员"
					price="免费"
					data={[
						{ description: "基础对话", value: "200次/每日" },
						{ description: "高级对话", value: "5次/每日" },
						{ description: "塔罗占卜", value: "1次/每日" },
					]}
					isCurrentPackage={currentPackage("free")}
					onUpgrade={() => {
						setProductKey("free_membership"); // 假设免费会员的 product_id 为 1
						handleUpgrade("free");
					}}
				/>
				<CardComponent
					title="黄金会员"
					price={
						isYearly ? (
							<>
								<span className={styles.originalPrice}>
									{formatPrice(getPrice("gold", true).original, true)}
								</span>{" "}
								{formatPrice(getPrice("gold", true).discounted, true)}
							</>
						) : (
							formatPrice(getPrice("gold", false).original, false)
						)
					}
					data={[
						{ description: "基础对话", value: "1000次/每日" },
						{ description: "高级对话", value: "30次/每日" },
						{ description: "塔罗占卜", value: "5次/每日" },
					]}
					isCurrentPackage={currentPackage("gold")}
					onUpgrade={() => {
						setProductKey("gold_membership"); // 假设黄金会员的 product_id 为 2
						handleUpgrade("gold");
					}}
				/>
				<CardComponent
					title="钻石会员"
					price={
						isYearly ? (
							<>
								<span className={styles.originalPrice}>
									{formatPrice(getPrice("diamond", true).original, true)}
								</span>{" "}
								{formatPrice(getPrice("diamond", true).discounted, true)}
							</>
						) : (
							formatPrice(getPrice("diamond", false).original, false)
						)
					}
					data={[
						{ description: "基础对话", value: "无限" },
						{ description: "高级对话", value: "100次/每日" },
						{ description: "塔罗占卜", value: "10次/每日" },
					]}
					isCurrentPackage={currentPackage("diamond")}
					onUpgrade={() => {
						setProductKey("diamond_membership"); // 假设钻石会员的 product_id 为 3
						handleUpgrade("diamond");
					}}
				/>
			</div>
		</div>
	);
};

export default MembershipUpgrade;
