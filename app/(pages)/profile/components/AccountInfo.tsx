import React from "react";
import { Button } from "antd";
import styles from "../profile.module.scss";
import { User } from "@/app/store";
import { getMembershipInfo, MembershipLevel } from "../membershipUtils";

interface AccountInfoProps {
	user: User;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ user }) => {
	const membershipInfo = getMembershipInfo(
		user.membership_level as MembershipLevel,
	);
	const Icon = membershipInfo.icon;

	return (
		<div className={styles.accountInfo}>
			<h2>账户</h2>
			<div className={styles.membershipInfo}>
				<Icon
					className={styles[`membershipIcon${membershipInfo.displayName}`]}
				/>
				<span className={styles.membershipLevel}>
					{membershipInfo.displayName}
				</span>
			</div>
			<p className={styles.membershipDescription}>
				{membershipInfo.description}
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
