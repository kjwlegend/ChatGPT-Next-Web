import React from "react";
import { Button } from "antd";
import styles from "../profile.module.scss";
import { CrownOutlined, UserOutlined } from "@ant-design/icons";
import { User } from "@/app/store";

interface AccountInfoProps {
	user: User;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ user }) => {
	const getMembershipIcon = (level: string) => {
		switch (level) {
			case "高级会员":
				return <CrownOutlined className={styles.membershipIconGold} />;
			case "普通会员":
				return <UserOutlined className={styles.membershipIconNormal} />;
			default:
				return null;
		}
	};

	const getMembershipDescription = (level: string) => {
		switch (level) {
			case "高级会员":
				return "每天重置 100 次基础对话, 50 次高级对话, 10 次绘画";
			case "普通会员":
				return "每天重置 50 次基础对话, 10 次高级对话, 2 次绘画";
			default:
				return "";
		}
	};

	return (
		<div className={styles.accountInfo}>
			<h2>账户</h2>
			<div className={styles.membershipInfo}>
				{getMembershipIcon(user.membership_level)}
				<span className={styles.membershipLevel}>{user.membership_level}</span>
			</div>
			<p className={styles.membershipDescription}>
				{getMembershipDescription(user.membership_level)}
			</p>
			<p>到期时间: {user.membership_expiry_date}</p>
			<p>
				小光币:{" "}
				<span className={styles.highlightText}>{user.virtual_currency}</span>
			</p>
			<p>
				专属 ID: <span className={styles.highlightText}>{user.id}</span>
			</p>
			<Button type="primary">升级会员</Button>
		</div>
	);
};

export default AccountInfo;
