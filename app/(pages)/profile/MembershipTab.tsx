"use client";
import React from "react";
import { useUserStore } from "../../store/user";
import { Col, Row, Statistic } from "antd";
import styles from "./profile.module.scss";

const MembershipTab = () => {
	const { user } = useUserStore();
	const {
		membership_level,
		user_balance,
		membership_expiry_date,
		virtual_currency,
	} = user;

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
						value={user_balance.basic_chat_balance || ""}
					/>
				</Col>
			</Row>
		</div>
	);
};

export default MembershipTab;
