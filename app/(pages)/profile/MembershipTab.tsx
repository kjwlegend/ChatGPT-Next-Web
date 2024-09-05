"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import { useUserStore } from "../../store/user";
import styles from "./profile.module.scss";

import { Col, Divider, Row, Statistic, message } from "antd";
import { Modal, Button, Radio } from "antd"; // 引入 Modal 和 Button 组件
import { Typography } from "antd";
import { SmileTwoTone } from "@ant-design/icons";
import { QRCode } from "antd";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";
import { membership_level, upgradeMember } from "../../api/backend/user";
import { type } from "os";
import Image from "next/image";
import { epaySigniture } from "../../services/ePayService";

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

	const {
		membership_level,
		user_balance,
		membership_expiry_date,
		last_refresh_date,
		virtual_currency,
	} = user;

	const { basic_chat_balance } = user_balance;

	return (
		<div>
			<Row justify="center" gutter={16} style={{ textAlign: "center" }}>
				<Col xs={12} sm={4}>
					<Statistic title="会员类型" value={membership_level} />
				</Col>
				<Col xs={12} sm={4}>
					<Statistic title="会员到期时间" value={membership_expiry_date} />
				</Col>
				<Col xs={12} sm={4}>
					<Statistic title="小光币" value={virtual_currency || ""} />
				</Col>
				<Col xs={12} sm={4}>
					<Statistic
						title="剩余对话次数"
						value={basic_chat_balance || ""}
						groupSeparator=""
					/>
				</Col>
				<Col xs={12} sm={4}>
					<Statistic
						title="对话重置时间"
						value={last_refresh_date || ""}
						groupSeparator=""
					/>
				</Col>
			</Row>
		</div>
	);
};

export default MembershipTab;
