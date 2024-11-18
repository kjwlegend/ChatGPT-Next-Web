import React from "react";
import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import styles from "../../workflow-chats.module.scss";

interface WelcomeContainerProps {
	isAuth: boolean;
	router: any;
	children?: React.ReactNode;
}

const WelcomeContainer: React.FC<WelcomeContainerProps> = ({
	isAuth,
	router,
	children,
}) => {
	if (!isAuth) {
		return (
			<div className={styles["welcome-container"]}>
				<div className={styles["title"]}>您还未登录, 请登录后开启该功能</div>
				<div className={styles["actions"]}>
					<Button
						type="default"
						className={styles["action-button"]}
						icon={<PlusCircleOutlined />}
						onClick={() => router.push("/auth/")}
					>
						登录
					</Button>
				</div>
			</div>
		);
	}

	return <div className={styles["welcome-container"]}>{children}</div>;
};

export default WelcomeContainer;
