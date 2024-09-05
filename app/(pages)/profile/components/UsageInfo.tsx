import React from "react";
import styles from "../profile.module.scss";

interface UsageInfoProps {
	user: any;
}

const UsageInfo: React.FC<UsageInfoProps> = ({ user }) => {
	return (
		<div className={styles.usageInfo}>
			<h2>使用情况</h2>
			<div className={styles.usageItem}>
				<h3>高级模型</h3>
				<p>已使用 {user.user_balance.advanced_chat_balance} 次，共 50 次</p>
				<div className={styles.usageBar}>
					<div
						className={styles.usageProgress}
						style={{
							width: `${(user.user_balance.advanced_chat_balance / 50) * 100}%`,
						}}
					></div>
				</div>
			</div>
			<div className={styles.usageItem}>
				<h3>基础模型</h3>
				<p>已使用 {user.user_balance.basic_chat_balance} 次，共 200 次</p>
				<div className={styles.usageBar}>
					<div
						className={styles.usageProgress}
						style={{
							width: `${(user.user_balance.basic_chat_balance / 200) * 100}%`,
						}}
					></div>
				</div>
			</div>
		</div>
	);
};

export default UsageInfo;
