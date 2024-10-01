import React from "react";
import styles from "../profile.module.scss";
import { User } from "@/app/store";
import { getMembershipInfo, MembershipLevel } from "../membershipUtils";

interface UsageInfoProps {
	user: User;
}

const UsageInfo: React.FC<UsageInfoProps> = ({ user }) => {
	const membershipInfo = getMembershipInfo(
		user.membership_level as MembershipLevel,
	);

	const renderUsageItem = (type: string, subtype: string, total: number) => {
		const balance =
			user.user_balance[
				`${subtype.toLowerCase()}_${type.toLowerCase()}_balance` as keyof User["user_balance"]
			];
		const percentage = (balance / total) * 100;

		return (
			<div key={`${type}-${subtype}`} className={styles.usageItem}>
				<h3>
					{subtype}模型 ({type})
				</h3>
				<p>
					剩余 {balance} 次，共 {total} 次
				</p>
				<div className={styles.usageBar}>
					<div
						className={styles.usageProgress}
						style={{ width: `${percentage}%` }}
					></div>
				</div>
			</div>
		);
	};

	return (
		<div className={styles.usageInfo}>
			<h2>使用情况</h2>
			{membershipInfo.rewards.map(({ type, subtype, total }) =>
				renderUsageItem(type, subtype, total),
			)}
		</div>
	);
};

export default UsageInfo;
