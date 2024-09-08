"use client";
import React, { useState, useEffect } from "react";
import styles from "../products.module.scss";
import { useUserStore } from "../../store/user";
import useAuth from "../../hooks/useAuth";
import { membership_level } from "../../api/backend/user";
import Image from "next/image";
import {
	Col,
	Row,
	Statistic,
	message,
	Modal,
	Button,
	Radio,
	Switch,
} from "antd";
import MembershipUpgrade from "./components/MembershipUpgrade";
import SingleItemsPage from "./components/SingleItemPurchase";

const ProductPage = () => {
	const { user } = useUserStore();
	const { updateUserInfo } = useAuth();

	const [messageApi, contextHolder] = message.useMessage();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedMembershipType, setSelectedMembershipType] = useState(
		"free" as membership_level,
	);
	const [paymentMethod, setPaymentMethod] = useState("1");
	const [isYearly, setIsYearly] = useState(false);

	const [selectedMembershipName, setSelectedMembershipName] =
		useState("免费会员");
	useEffect(() => {
		switch (selectedMembershipType) {
			case "free":
				setSelectedMembershipName("免费会员");
				break;
			case "gold":
				setSelectedMembershipName("黄金会员");
				break;
			case "diamond":
				setSelectedMembershipName("钻石会员");
				break;
			default:
				setSelectedMembershipName("免费会员");
		}
	}, [selectedMembershipType]);

	const {
		membership_level,
		user_balance,
		membership_expiry_date,
		last_refresh_date,
		id,
		virtual_currency,
	} = user;

	const { basic_chat_balance } = user_balance;

	const [price, setPrice] = useState({
		free: 0,
		gold: 20,
		diamond: 50,
	});

	useEffect(() => {
		updateUserInfo(id);
	}, [id]);

	const currentPackage = (packageType: string) => {
		return membership_level === packageType;
	};

	const handleUpgrade = (memberType: membership_level) => {
		setIsModalVisible(true);
		setSelectedMembershipType(memberType);
	};

	const handleModalClose = () => {
		setIsModalVisible(false);
	};

	const handlePaymentMethodChange = (e: any) => {
		setPaymentMethod(e.target.value);
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
		<div className="body-container">
			<MembershipUpgrade />
			<SingleItemsPage />
		</div>
	);
};

export default ProductPage;
