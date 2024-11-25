import { Button } from "antd";

import useAuth from "../hooks/useAuth";
import styles from "./button.module.scss";
import { useChatStore } from "../store/chat/index";
interface LogoutButtonProps {
	isButton?: boolean;
}

const LogoutButton = ({ isButton = true }: LogoutButtonProps) => {
	const auth = useAuth();

	const handleLogout = async (e: React.MouseEvent) => {
		console.log("点击事件", e);
		e.stopPropagation();
		try {
			console.log("开始登出");
			await auth.logoutHook();
			console.log("登出成功");
		} catch (error) {
			console.error("登出失败", error);
		}
	};

	if (isButton) {
		return (
			// <div>
			<Button onClick={(e) => handleLogout(e)} className={styles["logout"]}>
				注销登出
			</Button>
			// </div>
		);
	}

	return (
		<div onClick={(e) => handleLogout(e)} style={{ cursor: "pointer" }}>
			登出
		</div>
	);
};

export default LogoutButton;
